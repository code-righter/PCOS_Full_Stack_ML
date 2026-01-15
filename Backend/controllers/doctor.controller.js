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
        status: {
          in : ["ML_PROCESSED", "ML_PROCESSING", "PENDING"]
        },
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

export const getCurrentPatientReviewRequest = async (req, res) => {
  try {
    const doctorEmail = req.doctor.email;
    const { patientEmail } = req.params;

    if (!patientEmail) {
      return res.status(400).json({
        error: "Patient email is required",
      });
    }

    // 1️⃣ Fetch patient personal & lifestyle info
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

    // 2️⃣ Fetch latest ACTIVE analysis (not whole timeline)
    const analysis = await prisma.dataForDocAnalysis.findFirst({
      where: {
        patientId: patientEmail,
        doctorId: doctorEmail,
        status: {
          in: ["PENDING", "ML_PROCESSING", "ML_PROCESSED"],
        },
      },
      orderBy: {
        createdAt: "desc", // latest active request
      },
      select: {
        id: true,
        status: true,
        createdAt: true,

        doctor: {
          select: {
            name: true,
          },
        },

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
      },
    });

    if (!analysis) {
      return res.status(404).json({
        message: "No active review request found for this patient",
      });
    }

    // 3️⃣ Prepare doctor-review payload
    const responsePayload = {
      patient: patientInfo,

      analysis: {
        analysisId: analysis.id,
        status: analysis.status,
        createdAt: analysis.createdAt,
        doctorName: analysis.doctor?.name || null,
      },

      sensorData: analysis.sensorData,

      mlResult:
        analysis.status === "ML_PROCESSED"
          ? analysis.mlResult
          : null,
    };

    return res.status(200).json(responsePayload);

  } catch (error) {
    console.error("Current patient review fetch error:", error);
    return res.status(500).json({
      error: "Failed to fetch current patient review request",
    });
  }
};



export const getPatientTimeline = async (req, res) => {
  try {
    const doctorEmail = req.doctor.email;
    const {patientEmail } = req.params; 

    if (!patientEmail) {
      return res.status(400).json({
        error: "Patient email is required",
      });
    }

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

    const timeline = await prisma.dataForDocAnalysis.findMany({
      where: {
        patientId: patientEmail,
        doctorId: doctorEmail, // access control
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        status: true,
        createdAt: true, // 📅 analysis submission date

        doctor: {
          select: {
            name: true, // 👨‍⚕️ doctor name
          },
        },

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
            approvedAt: true, // 📅 doctor approval date
          },
        },
      },
    });

    // 3️⃣ Shape response cleanly for frontend
    const formattedTimeline = timeline.map((item) => ({
      analysisId: item.id,
      status: item.status,

      analysisDate: item.createdAt,
      doctorName: item.doctor?.name || null,
      doctorApprovedAt: item.doctorReport?.approvedAt || null,

      sensorData: item.sensorData,
      mlResult: item.mlResult,
      doctorReport: item.doctorReport,
    }));

    return res.status(200).json({
      patient: patientInfo,
      totalRecords: formattedTimeline.length,
      timeline: formattedTimeline,
    });

  } catch (error) {
    console.error("Patient timeline fetch error:", error);
    return res.status(500).json({
      error: "Failed to fetch patient timeline",
    });
  }
};


export const getModelAnalysis = async (req, res)=>{
  try{

  }catch(err){

  }
} 

export const submitDoctorsReport = async(req, res)=>{
  try{

  }catch(err){
    
  }
}
