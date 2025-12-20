import prisma from "../db/prisma.js";
import redisClient from "../config/redis.js";

export const getPersonalInfo = async (req, res) => {
  try {
    const userEmail = req.userEmail;

    const personalInfo = await prisma.patientPersonalInfo.findUnique({
      where: { email: userEmail }
    });

    if (!personalInfo) {
      return res.status(404).json({
        error: "Personal information not found"
      });
    }

    return res.status(200).json({
      data: personalInfo
    });

  } catch (err) {
    console.error("Get PersonalInfo error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};



export const setPersonalInfo = async (req, res) => {
  try {
    const userEmail = req.userEmail;

    const {
      cycleLength,
      cycleType,
      skinDarkening,
      hairGrowth,
      pimples,
      hairLoss,
      weightGain,
      fastFood,
      hip,
      waist
    } = req.body;


    const updatedInfo = await prisma.patientPersonalInfo.update({
      where: { email: userEmail },
      data: {
        cycleLength,
        cycleType,
        skinDarkening,
        hairGrowth,
        pimples,
        hairLoss,
        weightGain,
        fastFood,
        hip,
        waist
      }
    });

    return res.status(200).json({
      message: "Personal information updated successfully",
      data: updatedInfo
    });

  } catch (err) {
    console.error("Set PersonalInfo error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

import prisma from "../db/prisma.js";

export const getPatientTimeline = async (req, res) => {
  try {
    const patientEmail = req.userEmail;

    if (!patientEmail) {
      return res.status(400).json({
        error: "Patient email is required",
      });
    }

    // 🔥 Single optimized query
    const timeline = await prisma.dataForDocAnalysis.findMany({
      where: {
        patientId: patientEmail,
      },
      orderBy: {
        createdAt: "desc", // latest → oldest
      },
      select: {
        id: true,
        status: true,
        createdAt: true,

        // Optional: include input summary only
        inputData: true,

        mlResult: {
          select: {
            prediction: true,
            confidenceScore: true,
            modelVersion: true,
            generatedAt: true,
          },
        },

        doctorReport: {
          select: {
            finalVerdict: true,
            prescription: true,
            notes: true,
            approvedAt: true,
          },
        },
      },
    });

    return res.status(200).json({
      patientEmail,
      totalRecords: timeline.length,
      timeline,
    });

  } catch (error) {
    console.error("Patient timeline fetch error:", error);
    return res.status(500).json({
      error: "Failed to fetch patient timeline",
    });
  }
};
