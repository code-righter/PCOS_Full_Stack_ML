import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import prisma from '../db/prisma.js';
import redisClient from "../config/redis.js";
import logger from '../utils/logger.js'; // Import the logger

// --- Helper Functions ---

export const sendOtpEmail = async (email, otp) => {
  // Log the attempt to send email
  logger.info(`Attempting to send OTP email to: ${email}`, { resource: 'EmailService' });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    await transporter.sendMail({
      from: `"Hospital App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your email",
      html: `
        <h2>Email Verification</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP is valid for <b>2 minutes</b>.</p>
      `
    });
    logger.info(`OTP email sent successfully to ${email}`, { resource: 'EmailService' });
  } catch (error) {
    logger.error(`Failed to send email: ${error.message}`, { resource: 'EmailService' });
    throw error; // Re-throw to be caught by the controller
  }
};

// --- Controllers ---

export const signUpPatient = async (req, res) => {
  const resource = 'auth/SignUp'; // Define resource context
  
  try {
    const { name, email, password, phoneNumber } = req.body;

    // Log the initiation of the flow
    logger.info(`Registration request received for email: ${email}`, { 
      resource, 
      method: req.method, 
      route: req.originalUrl 
    });

    if (!name || !email || !password || !phoneNumber) {
      logger.warn('Registration failed: Missing fields', { resource });
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      logger.warn(`Registration failed: User already exists (${email})`, { resource });
      return res.status(409).json({ error: "User already exists" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    // DB Operation: Cleanup old OTPs
    await prisma.emailVerification.deleteMany({
      where: { email }
    });

    // DB Operation: Save new OTP
    await prisma.emailVerification.create({
      data: { email, otp, expiresAt }
    });

    logger.info('OTP generated and stored in DB', { resource });

    // Send email
    await sendOtpEmail(email, otp);

    return res.status(200).json({
      message: "OTP sent to email. Valid for 2 minutes."
    });

  } catch (err) {
    logger.error(`Registration error: ${err.message}`, { resource });
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const verifyOtpAndCreateAccount = async (req, res) => {
  const resource = 'Auth/VerifyOTP';

  try {
    const { name, age, email, password, phoneNumber, otp } = req.body;

    logger.info(`OTP verification attempt for: ${email}`, { 
      resource, 
      method: req.method, 
      route: req.originalUrl 
    });

    if (!otp || !email) {
      logger.warn('Verification failed: Missing OTP or Email', { resource });
      return res.status(400).json({ error: "OTP and email required" });
    }

    const record = await prisma.emailVerification.findUnique({
      where: { email }
    });

    if (!record) {
      logger.warn('Verification failed: No OTP record found', { resource });
      return res.status(400).json({ error: "OTP not found" });
    }

    // Check expiry
    if (record.expiresAt < new Date()) {
      logger.warn('Verification failed: OTP expired', { resource });
      return res.status(400).json({ error: "OTP expired" });
    }

    // Check OTP match
    if (record.otp !== otp) {
      logger.warn('Verification failed: Invalid OTP provided', { resource });
      return res.status(400).json({ error: "Invalid OTP" });
    }

    logger.info('OTP validated successfully. Creating user...', { resource });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user 
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        userType: "patient",
        isLoggedIn: false,
        patientPersonalInfo: {
          create: {
            name,
            email,
            age,
            phoneNumber,
            age: 0,
            cycleLength: 0,
            cycleType: "REGULAR",
            skinDarkening: false,
            hairGrowth: false,
            pimples: false,
            hairLoss: false,
            weightGain: false,
            fastFood: false,
            hip: 0,
            waist: 0
          }
        }
      }
    });

    // Delete OTP after success
    await prisma.emailVerification.delete({
      where: { email }
    });

    logger.info(`User created successfully with ID: ${user.email}`, { resource });

    return res.status(201).json({
      message: "Account verified & created successfully",
      user
    });

  } catch (err) {
    logger.error(`Verification error: ${err.message}`, { resource });
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const signInPatient = async (req, res) => {
  const resource = 'Auth/SignIn';

  try {
    const { email, password } = req.body;
    const clientSessionId = req.headers["x-session-id"];

    logger.info(`Login attempt for: ${email}`, { 
      resource, 
      method: req.method, 
      route: req.originalUrl 
    });

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      logger.warn(`Login failed: User not found (${email})`, { resource });
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Login failed: Incorrect password (${email})`, { resource });
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const userKey = `user:${user.email}`;

    // Redis: Check concurrent login
    const existingSessionId = await redisClient.get(userKey);

    if (existingSessionId && existingSessionId === clientSessionId) {
      logger.info(`Login successful. Session restored for user ${user.email}`, { resource });
      return res.status(200).json({
        message: "Already logged in",
        sessionId: existingSessionId
      });
    }

    // ❌ Different device
    if (existingSessionId && existingSessionId !== clientSessionId) {
      logger.warn(`Login blocked: Active session exists for user ${user.email}`, { resource });
      return res.status(403).json({
        error: "User already logged in on another device"
      });
    }

    // Create Session
    const ttlSeconds = 5 * 60;
    const sessionId = crypto.randomUUID();

    await redisClient.setex(`session:${sessionId}`, ttlSeconds, user.email.toString());
    await redisClient.setex(`user:${user.email}`, ttlSeconds, sessionId);

    logger.info(`Login successful. Session created for user ${user.email}`, { resource });

    return res.status(200).json({
      message: "Login successful",
      data: email,
      sessionId,
      expiresIn: ttlSeconds
    });

  } catch (err) {
    logger.error(`Login error: ${err.message}`, { resource });
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const heartbeat = async (req, res) => {
  const resource = 'Auth/Heartbeat';

  try {
    const sessionId = req.headers["x-session-id"];

    if (!sessionId) {
      logger.warn('Heartbeat failed: Missing Session ID', { resource });
      return res.status(401).json({ error: "Session ID missing" });
    }

    const sessionKey = `session:${sessionId}`;
    const userId = await redisClient.get(sessionKey);

    if (!userId) {
      logger.warn(`Heartbeat failed: Session expired or invalid (${sessionId})`, { resource });
      return res.status(401).json({ error: "Session expired" });
    }

    const ttlSeconds = 5 * 60;

    // Extend Redis keys
    await redisClient.expire(sessionKey, ttlSeconds);
    await redisClient.expire(`user:${userId}`, ttlSeconds);

    logger.info(`Session extended for user ${userId}`, { resource });

    return res.status(200).json({
      message: "Session extended",
      expiresIn: ttlSeconds
    });

  } catch (err) {
    logger.error(`Heartbeat error: ${err.message}`, { resource });
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const signOutPatient = async (req, res) => {
  const resource = 'Auth/SignOut';

  try {
    const sessionId = req.headers["x-session-id"];

    logger.info('Logout request received', { resource });

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID missing" });
    }

    const userId = await redisClient.get(`session:${sessionId}`);

    if (userId) {
      await redisClient.del(`user:${userId}`);
      logger.info(`Cleared active user key for user ${userId}`, { resource });
    }

    await redisClient.del(`session:${sessionId}`);
    
    logger.info(`Session invalidated successfully`, { resource });

    return res.status(200).json({
      message: "Logged out successfully"
    });

  } catch (err) {
    logger.error(`Logout error: ${err.message}`, { resource });
    return res.status(500).json({ error: "Internal server error" });
  }
};