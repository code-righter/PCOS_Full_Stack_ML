import bcrypt from "bcrypt";
import prisma from '../db/prisma.js';
import prisma from "../db/prisma.js";
import { signJwt } from "../utils/jwt.js";

export const signInDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    // 2️⃣ Find doctor
    const doctor = await prisma.doctor.findUnique({
      where: { email },
    });

    if (!doctor) {
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

    // 5️⃣ Send response (DO NOT send password)
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
    console.error("Doctor sign-in error:", error);
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