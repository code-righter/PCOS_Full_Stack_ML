import prisma from "../db/prisma.js";

export const getPersonalData = async (req, res) => {
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



export const setPersonalData = async (req, res) => {
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


export const getPatientTimeline = async (req, res) => {
  try {
    const doctorEmail = req.doctor.email;
    const { patientEmail } = req.params;

    if (!patientEmail) {
      return res.status(400).json({
        error: "Patient email is required",
      });
    }

    // 1️⃣ Fetch patient lifestyle & health info (ONE TIME)
    const patientInfo = await prisma.patientPersonalInfo.findUnique({
      where: { email: patientEmail },
      select: {
        name: true,
        age: true,

        cycleLength: true,
        cycleType: true,

        skinDarkening: true,
        hairGrowth: true,
        pimples: true,
        hairLoss: true,
        weightGain: true,

        fastFood: true,
        hip: true,
        waist: true,
      },
    });

    if (!patientInfo) {
      return res.status(404).json({
        error: "Patient not found",
      });
    }

    // 2️⃣ Fetch timeline (latest → oldest)
    const timeline = await prisma.dataForDocAnalysis.findMany({
      where: {
        patientId: patientEmail,
        doctorId: doctorEmail,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        status: true,
        createdAt: true,

        sensorData: {
          select: {
            spo2: true,
            temperature: true,
            heartRate: true,
            height: true,
            weight: true,
            recordedAt: true,
          },
        },

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
      patient: patientInfo,
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
