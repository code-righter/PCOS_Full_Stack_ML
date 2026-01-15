import prisma from "../db/prisma.js";

export const getDocDashboardMetrics = async (req, res) => {
  try {
    const doctorEmail = req.doctor.email;

    // 1️⃣ Pending requests count
    const pendingRequestsCount = await prisma.dataForDocAnalysis.count({
      where: {
        doctorId: doctorEmail,
        status: {
          in : ["PENDING", "ML_PROCESSED", "ML_PROCESSING"]
        }
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

    // 1️⃣ Fetch latest ACTIVE analysis for this patient + doctor
    const analysis = await prisma.dataForDocAnalysis.findFirst({
      where: {
        patientId: patientEmail,
        doctorId: doctorEmail,
        status: {
          in: ["PENDING", "ML_PROCESSING", "ML_PROCESSED"],
        },
      },
      orderBy: {
        createdAt: "desc",
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

        testData: {
          select: {
            // Patient snapshot
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

            // Sensor readings
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

    // 2️⃣ Prepare doctor-review payload (time-consistent)
    const responsePayload = {
      patientEmail,

      analysis: {
        analysisId: analysis.id,
        status: analysis.status,
        createdAt: analysis.createdAt,
        doctorName: analysis.doctor?.name || null,
      },

      testData: {
        // Lifestyle & health snapshot
        cycleLength: analysis.testData.cycleLength,
        cycleType: analysis.testData.cycleType,
        skinDarkening: analysis.testData.skinDarkening,
        hairGrowth: analysis.testData.hairGrowth,
        pimples: analysis.testData.pimples,
        hairLoss: analysis.testData.hairLoss,
        weightGain: analysis.testData.weightGain,
        fastFood: analysis.testData.fastFood,
        hip: analysis.testData.hip,
        waist: analysis.testData.waist,

        // Sensor data
        spo2: analysis.testData.spo2,
        temperature: analysis.testData.temperature,
        heartRate: analysis.testData.heartRate,
        height: analysis.testData.height,
        weight: analysis.testData.weight,
        recordedAt: analysis.testData.recordedAt,
      },

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

    // 1️⃣ Fetch patient BASIC info (for header only, NOT timeline logic)
    const patientInfo = await prisma.patientPersonalInfo.findUnique({
      where: { email: patientEmail },
      select: {
        name: true,
        age: true,
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
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        status: true,
        createdAt: true,

        testData: {
          select: {
            // Lifestyle snapshot
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

            // Sensor values
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
      patient: {
        name: patientInfo.name,
        age: patientInfo.age,
      },
      totalRecords: timeline.length,
      timeline: timeline.map((item) => ({
        analysisId: item.id,
        status: item.status,
        createdAt: item.createdAt,

        testData: item.testData,

        mlResult: item.mlResult || null,
        doctorReport: item.doctorReport || null,
      })),
    });

  } catch (error) {
    console.error("Patient timeline fetch error:", error);
    return res.status(500).json({
      error: "Failed to fetch patient timeline",
    });
  }
};

export const updatePatientReport = async (req, res) => {
  try {
    const doctorEmail = req.doctor.email;
    const { analysisId } = req.params;

    const { verdict, prescription, status } = req.body;

    // 1️⃣ Basic validation
    if (!analysisId) {
      return res.status(400).json({
        error: "analysisId is required",
      });
    }

    if (!finalVerdict) {
      return res.status(400).json({
        error: "finalVerdict (diagnosis) is required",
      });
    }

    // 2️⃣ Fetch analysis & verify ownership
    const analysis = await prisma.dataForDocAnalysis.findUnique({
      where: { id: analysisId },
      select: {
        id: true,
        status: true,
        doctorId: true,
        doctorReport: {
          select: { id: true },
        },
      },
    });

    if (!analysis) {
      return res.status(404).json({
        error: "Analysis not found",
      });
    }

    // if (analysis.doctorId !== doctorEmail) {
    //   return res.status(403).json({
    //     error: "You are not authorized to update this report",
    //   });
    // }

    // if (analysis.status !== "ML_PROCESSED") {
    //   return res.status(400).json({
    //     error: `Cannot submit report when status is ${analysis.status}`,
    //   });
    // }

    // if (analysis.doctorReport) {
    //   return res.status(400).json({
    //     error: "Doctor report already exists for this analysis",
    //   });
    // }

    // 3️⃣ Create Doctor Report
    const report = await prisma.doctorReport.create({
      data: {
        analysisId,
        doctorId: doctorEmail,
        finalVerdict : verdict,
        prescription: prescription || null,
        notes: status || null,
      },
    });

    // 4️⃣ Mark analysis as COMPLETED
    await prisma.dataForDocAnalysis.update({
      where: { id: analysisId },
      data: { status: "COMPLETED" },
    });

    // 5️⃣ Response
    return res.status(201).json({
      message: "Patient report submitted successfully",
      report: {
        id: report.id,
        analysisId: report.analysisId,
        finalVerdict: report.finalVerdict,
        prescription: report.prescription,
        notes: report.notes,
        approvedAt: report.approvedAt,
      },
    });

  } catch (error) {
    console.error("Update patient report error:", error);
    return res.status(500).json({
      error: "Failed to update patient report",
    });
  }
};



