import prisma from "../db/prisma.js";

export const getDocDashboardMetrics = async (req, res) => {
  try {
    const doctorEmail = req.doctor.email;

    // 1️⃣ Pending requests count
    const pendingRequestsCount = await prisma.dataForDocAnalysis.count({
      where: {
        doctorId: doctorEmail,
        status: "PENDING",
      },
    });

    // 2️⃣ Total unique patients till now
    const totalPatients = await prisma.dataForDocAnalysis.findMany({
      where: {
        doctorId: doctorEmail,
      },
      select: {
        patientId: true,
      },
      distinct: ["patientId"],
    });

    return res.status(200).json({
      data : {
        pendingRequestsCount,
        totalPatientsCount: totalPatients.length, 
      }
    });

  } catch (error) {
    console.error("Doctor dashboard metrics error:", error);
    return res.status(500).json({
      error: "Failed to fetch dashboard metrics",
    });
  }
};


export const getPendingPatientsData = async (req, res) => {
  try {
    const doctorEmail = req.doctor.email;

    const pendingRequests = await prisma.dataForDocAnalysis.findMany({
      where: {
        doctorId: doctorEmail,
        status: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        createdAt: true,
        status: true,
        patient: {
          select: {
            name: true,
            email: true,
            age: true,
            phoneNumber: true,
            cycleType: true,
          },
        },
      },
    });

    return res.status(200).json({
      count: pendingRequests.length,
      data: pendingRequests,
    });

  } catch (error) {
    console.error("Pending patients fetch error:", error);
    return res.status(500).json({
      error: "Failed to fetch pending patients data",
    });
  }
};

export const getAllPatients = async (req, res) => {
  try {
    const doctorEmail = req.doctor.email;

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const skip = (page - 1) * limit;

    const patients = await prisma.dataForDocAnalysis.findMany({
      where: {
        doctorId: doctorEmail,
      },
      orderBy: {
        createdAt: "desc", 
      },
      distinct: ["patientId"], 
      skip,
      take: limit,
      select: {
        patientId: true,
        createdAt: true,

        patient: {
          select: {
            name: true,
            email: true,
            age: true,
            cycleType: true,
          },
        },
      },
    });

    const totalPatients = await prisma.dataForDocAnalysis.findMany({
      where: {
        doctorId: doctorEmail,
      },
      select: {
        patientId: true,
      },
      distinct: ["patientId"],
    });

    return res.status(200).json({
      page,
      limit,
      totalPatients: totalPatients.length,
      totalPages: Math.ceil(totalPatients.length / limit),
      data: patients.map((p) => ({
        lastInteractionAt: p.createdAt,
        ...p.patient,
      })),
    });

  } catch (error) {
    console.error("Get all patients error:", error);
    return res.status(500).json({
      error: "Failed to fetch patients",
    });
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
