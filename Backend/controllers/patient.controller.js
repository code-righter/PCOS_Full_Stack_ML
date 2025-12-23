import prisma from "../db/prisma.js";
import redisClient from "../config/redis.js";

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

export const generateCode = async (req, res) => {
  try {
    const userEmail = req.userEmail; // from requireSession

    // 6-digit numeric code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const ttlSeconds = 5 * 60;

    await redisClient.setex(
      `pairing:${code}`,
      ttlSeconds,
      JSON.stringify({
        email: userEmail,
        createdAt: Date.now()
      })
    );

    return res.status(200).json({
      message: "Pairing code generated",
      code,
      expiresIn: ttlSeconds
    });

  } catch (err) {
    console.error("Generate code error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const receiveSensorData = async (req, res) => {
  try {
    const { code, sensorData } = req.body;

    if (!code || !sensorData) {
      return res.status(400).json({ error: "Code and sensor data required" });
    }

    const pairingInfo = await redisClient.get(`pairing:${code}`);

    if (!pairingInfo) {
      return res.status(401).json({ error: "Invalid or expired code" });
    }

    const ttlSeconds = 5 * 60;

    await redisClient.setex(
      `sensor:${code}`,
      ttlSeconds,
      JSON.stringify({
        ...sensorData,
        receivedAt: Date.now()
      })
    );

    return res.status(200).json({
      message: "Sensor data received"
    });

  } catch (err) {
    console.error("Hardware data error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getLiveSensorData = async (req, res) => {
  try {
    const userEmail = req.userEmail;
    const { code } = req.params;

    const pairingInfo = await redisClient.get(`pairing:${code}`);
    if (!pairingInfo) {
      return res.status(404).json({ error: "Pairing expired" });
    }

    console.log('Pairing info found')

    const { email } = JSON.parse(pairingInfo);
    if (email !== userEmail) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const sensorData = await redisClient.get(`sensor:${code}`);
    console.log(`Sensor Data  ${sensorData}`);

    if (!sensorData) {
      return res.status(204).json({ status: "Incomplete" });
    }

    return res.status(200).json({
      status : "completed",
      data: JSON.parse(sensorData)
    });

  } catch (err) {
    console.error("Live sensor fetch error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const saveSensorData = async (req, res) => {
  try {
    const userEmail = req.userEmail;
    const { code } = req.body;

    const pairingInfo = await redisClient.get(`pairing:${code}`);
    const sensorDataRaw = await redisClient.get(`sensor:${code}`);

    if (!pairingInfo || !sensorDataRaw) {
      return res.status(400).json({ status: "pending" });
    }

    const { email } = JSON.parse(pairingInfo);
    if (email !== userEmail) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const sensorData = JSON.parse(sensorDataRaw);

    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });
    console.log('Sensor Data Received', sensorData)
    // 1️⃣ Save sensor data
    const savedSensor = await prisma.sensorData.create({
      data: {
        spo2: sensorData.spo2,
        temperature: sensorData.temperature,
        heartRate: sensorData.heartRate,
        height: sensorData.height,
        weight: sensorData.weight,
        patientEmail : userEmail
      }
    });

    // 2️⃣ Save doctor analysis entry
    await prisma.dataForDocAnalysis.create({
      data: {
        patientId: userEmail,
        sensorDataId: savedSensor.id,
        doctorId : "abhijeetkolhe@gmail.com"
      }
    });

    // Cleanup Redis
    await redisClient.del(`sensor:${code}`);
    await redisClient.del(`pairing:${code}`);

    return res.status(201).json({
      message: "Sensor data saved successfully"
    });

  } catch (err) {
    console.error("Save sensor data error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getPendingRequests = async(req, res)=>{
  try{
    const userEmail = req.userEmail;
    
    const pendingRequests = await prisma.dataForDocAnalysis.findMany({
      where : {
        patientId : userEmail,
        status : 'PENDING'
      }
    })

    if(!pendingRequests){
      return res.status(400).json({
        message : "No pending request found"
      })
    }

    return res.status(200).json({
      data : pendingRequests
    })


  }catch(err){
    console.error("Pending request error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}