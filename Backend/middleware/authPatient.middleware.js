import jwt from 'jsonwebtoken'
import redisClient from "../config/redis.js";
import prisma from "../db/prisma.js"; // Needed to check UserType
import logger from "../utils/logger.js"; // Import your logger

export const verifySession = async (req, res, next) => {
  const resource = 'Middleware/Session';

  try {
    const sessionId = req.headers["x-session-id"];

    // Log entry (Optional: can be 'debug' level to reduce noise)
    logger.info('Verifying session headers', { resource }); 

    if (!sessionId) {
      logger.warn('Access denied: Missing Session ID header', { resource });
      return res.status(401).json({ error: "Session ID missing" });
    }

    // Retrieve data associated with session (Email or UserID)
    const email = await redisClient.get(`session:${sessionId}`);

    if (!email) {
      logger.warn(`Access denied: Invalid or expired session (${sessionId})`, { resource });
      return res.status(401).json({ error: "Session expired or invalid" });
    }

    // Attach identity to request for the next middleware
    req.userEmail = email;

    // Log success
    // logger.info(`Session validated for user: ${email}`, { resource }); 
    
    next();
    
  } catch (err) {
    logger.error(`Session validation error: ${err.message}`, { resource });
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const authorizePatient = async (req, res, next) => {
  const resource = 'Middleware/RBAC'; // Role-Based Access Control

  try {
    const email = req.userEmail; // Passed from verifySession

    if (!email) {
       logger.error('Authorization failed: No user identity found in request', { resource });
       return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { userType: true } // Only fetch what we need
    });

    if (!user) {
      logger.warn(`Authorization failed: User record not found for ${email}`, { resource });
      return res.status(401).json({ error: "User not found" });
    }

    if (user.userType !== 'patient') {
      logger.warn(`Access forbidden: User ${email} (Role: ${user.userType}) attempted to access Patient resource`, { resource });
      return res.status(403).json({ error: "Access denied: Patients only" });
    }

    // Access Granted
    logger.info(`Access granted: Patient ${email}`, { resource, route: req.originalUrl });
    next();

  } catch (err) {
    logger.error(`Authorization error: ${err.message}`, { resource });
    return res.status(500).json({ error: "Internal server error" });
  }
}

export const authorizeDoctor = async (req, res, next) => {
  const resource = 'Middleware/RBAC';

  try {
    const email = req.userEmail;

    if (!email) {
       logger.error('Authorization failed: No user identity found', { resource });
       return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { userType: true }
    });

    if (!user || user.userType !== 'doctor') {
      // Log the specific violation
      const role = user ? user.userType : 'Unknown';
      logger.warn(`Access forbidden: User ${email} (Role: ${role}) attempted to access Doctor resource`, { resource });
      
      return res.status(403).json({ error: "Access denied: Doctors only" });
    }

    // Access Granted
    logger.info(`Access granted: Doctor ${email}`, { resource, route: req.originalUrl });
    next();

  } catch (err) {
    logger.error(`Authorization error: ${err.message}`, { resource });
    return res.status(500).json({ error: "Internal server error" });
  }
}