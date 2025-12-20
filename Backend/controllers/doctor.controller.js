import prisma from "../db/prisma";

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
      pendingRequestsCount,
      totalPatientsCount: totalPatients.length,
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


export const getPatientTimeline = async (req, res) => {
  try {
    const doctorEmail = req.doctor.email;
    const { patientEmail } = req.params;

    if (!patientEmail) {
      return res.status(400).json({
        error: "Patient email is required",
      });
    }

    // 🔥 Single optimized query
    const timeline = await prisma.dataForDocAnalysis.findMany({
      where: {
        patientId: patientEmail,
        doctorId: doctorEmail, // ensures doctor can only see own patients
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
