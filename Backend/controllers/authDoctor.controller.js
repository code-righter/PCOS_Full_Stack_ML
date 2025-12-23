import bcrypt from "bcrypt";
import prisma from '../db/prisma.js';
import { signJwt } from "../utils/jwt.js";
import logger from '../utils/logger.js'; // Import the logger

export const signUpDoctor = async (req, res) => {
  const resource = 'Auth/DoctorSignUp';

  try {
    const { name, email, password, licenseNumber, specialization, experienceYears, hospital } = req.body;

    // Log Entry
    logger.info(`Doctor registration request received for: ${email}`, { 
      resource, 
      method: req.method 
    });

    if (!email || !password || !name || !licenseNumber) {
      logger.warn('Registration failed: Missing required fields', { resource });
      return res.status(400).json({
        error: "Incomplete form filled",
      });
    }

    const existingUser = await prisma.doctor.findUnique({
      where: { email }
    });

    if (existingUser) {
      logger.warn(`Registration failed: Doctor email already exists (${email})`, { resource });
      return res.status(409).json({ error: "Doctor already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const doctor = await prisma.doctor.create({
      data: {
        name,
        email,
        password: hashedPassword,
        licenseNumber,
        experienceYears,
        hospital,
        specialization
      }
    });

    // Log Success
    logger.info(`Doctor account created successfully [ID: ${doctor.id}]`, { resource });

    return res.status(201).json({
      message: "Account has been created successfully",
      doctor
    });

  } catch (err) {
    logger.error(`Registration error: ${err.message}`, { resource });
    return res.status(500).json({ error: "Internal server error" });
  }
}

export const signInDoctor = async (req, res) => {
  const resource = 'Auth/DoctorSignIn';

  try {
    const { email, password } = req.body;

    logger.info(`Doctor login attempt for: ${email}`, { 
      resource, 
      method: req.method 
    });

    // 1️⃣ Validate input
    if (!email || !password) {
      logger.warn('Login failed: Missing email or password', { resource });
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    // 2️⃣ Find doctor
    const doctor = await prisma.doctor.findUnique({
      where: { email },
    });

    if (!doctor) {
      logger.warn(`Login failed: Doctor not found (${email})`, { resource });
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // 3️⃣ Compare password
    const isPasswordValid = await bcrypt.compare(
      password,
      doctor.password
    );

    if (!isPasswordValid) {
      logger.warn(`Login failed: Invalid password (${email})`, { resource });
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // 4️⃣ Create JWT payload
    const tokenPayload = {
      doctorId: doctor.id,
      email: doctor.email,
    };

    const token = signJwt(tokenPayload);

    // Log Success (Do not log the token itself)
    logger.info(`Doctor login successful [ID: ${doctor.id}]`, { resource });

    // 5️⃣ Send response
    return res.status(200).json({
      message: "Doctor signed in successfully",
      token,
      doctor: {
        id: doctor.id,
        email: doctor.email,
        name: doctor.name,
        specialization: doctor.specialization,
        hospital: doctor.hospital,
      },
    });

  } catch (error) {
    logger.error(`Login error: ${error.message}`, { resource });
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const signOutDoctor = async (req, res, next)=>{
    try{

    }catch(err){

    }
}