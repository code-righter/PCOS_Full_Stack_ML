import prisma from "../db/prisma.js";
import redisClient from "../config/redis.js";
import { MLQueue } from "../queue/ml.queue.js";
import axios from "axios";
import logger from "../utils/logger.js"; // Import logger

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

    // Convert to correct types
    const parsedData = {
      cycleLength: parseInt(cycleLength, 10),      // String -> number
      cycleType: cycleType,                         // Keep as string (assuming String in schema)
      skinDarkening: cycleType === 'true' || cycleType === 'True' || skinDarkening === '1',  // String -> boolean
      hairGrowth: hairGrowth === 'true' || hairGrowth === 'True' || hairGrowth === '1',
      pimples: pimples === 'true' || pimples === 'True' || pimples === '1',
      hairLoss: hairLoss === 'true' || hairLoss === 'True' || hairLoss === '1',
      weightGain: weightGain === 'true' || weightGain === 'True' || weightGain === '1',
      fastFood: fastFood === 'true' || fastFood === 'True' || fastFood === '1',
      hip: parseInt(hip, 10),                       // String -> number
      waist: parseInt(waist, 10)                    // String -> number
    };

    // Handle NaN for numbers
    if (isNaN(parsedData.cycleLength)) {
      return res.status(400).json({ error: 'Invalid cycleLength value' });
    }
    if (isNaN(parsedData.hip)) {
      return res.status(400).json({ error: 'Invalid hip value' });
    }
    if (isNaN(parsedData.waist)) {
      return res.status(400).json({ error: 'Invalid waist value' });
    }

    const updatedInfo = await prisma.patientPersonalInfo.update({
      where: { email: userEmail },
      data: parsedData
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
    
    const doctorEmail = "abhijeetkolhe@gmail.com";
    const patientEmail  = req.userEmail;
    
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
  const resource = 'Sensor/Save'; // Resource tag

  try {
    const userEmail = req.userEmail;
    const { code } = req.body;

    // Log Entry
    logger.info(`Request to save sensor data for code: ${code}`, { 
      resource,
      method: req.method,
      user: userEmail 
    });

    // 1️⃣ Fetch from Redis
    const pairingInfo = await redisClient.get(`pairing:${code}`);
    const sensorDataRaw = await redisClient.get(`sensor:${code}`);

    if (!pairingInfo || !sensorDataRaw) {
      // Logic Warning: Client might be polling too early or data expired
      logger.warn(`Data not ready or expired for code: ${code}`, { resource });
      return res.status(400).json({ status: "pending" });
    }

    const { email } = JSON.parse(pairingInfo);
    
    // Security Check
    if (email !== userEmail) {
      logger.warn(`Unauthorized access attempt. User ${userEmail} tried to claim data for ${email}`, { resource });
      return res.status(403).json({ error: "Unauthorized" });
    }

    const sensorData = JSON.parse(sensorDataRaw);
    logger.info(`Redis data retrieved valid. Proceeding to DB storage.`, { resource });

    // 2️⃣ Save sensor data (DB)
    const savedSensor = await prisma.sensorData.create({
      data: {
        spo2: sensorData.spo2,
        temperature: sensorData.temperature,
        heartRate: sensorData.heartRate,
        height: sensorData.height,
        weight: sensorData.weight,
        patientEmail: userEmail,
      },
    });
    
    // 3️⃣ Create analysis record (DB)
    const analysis = await prisma.dataForDocAnalysis.create({
      data: {
        patientId: userEmail,
        sensorDataId: savedSensor.id,
        doctorId: "abhijeetkolhe@gmail.com", // You might want to make this dynamic later
        status: "PENDING",
      },
    });

    logger.info(`DB Records created. Analysis ID: ${analysis.id}`, { resource });

    // 4️⃣ Enqueue ML job (BullMQ)
    const job = await MLQueue.add(
      "RUN_ML",
      { analysisId: analysis.id },
      {
        attempts: 5,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: true,
      }
    );

    logger.info(`Job enqueued in ML_QUEUE. Job ID: ${job.id}`, { resource });

    // 5️⃣ Cleanup Redis
    await redisClient.del(`sensor:${code}`);
    await redisClient.del(`pairing:${code}`);
    
    logger.info(`Redis keys cleaned up for code: ${code}`, { resource });

    return res.status(201).json({
      message: "Sensor data saved. ML analysis in progress.",
      analysisId: analysis.id,
    });

  } catch (err) {
    logger.error(`Save sensor data failed: ${err.message}`, { resource });
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getPendingRequests = async(req, res)=>{
  try{
    const userEmail = req.userEmail;
    
    const pendingRequests = await prisma.dataForDocAnalysis.findMany({
      where : {
        patientId : userEmail,
        status : {
          in : ["PENDING", "ML_PROCESSED", "ML_PROCESSING"]
        }
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