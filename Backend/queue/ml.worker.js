import { Worker } from "bullmq";
import axios from "axios";
import prisma from "../db/prisma.js";
import { redisConnection } from "../queue/redis.js";
import logger from "../utils/logger.js"; // Import logger
import dotenv from "dotenv";
dotenv.config();

const worker = new Worker(
  "ML_QUEUE",
  async (job) => {
    const { analysisId } = job.data;
    const resource = 'Worker/ML_Queue'; // Tag for this specific worker

    // Context object for logs (includes Job ID for tracing)
    const logContext = { resource, jobId: job.id, analysisId };

    try {
      logger.info(`Job received. Starting ML pipeline for Analysis ID: ${analysisId}`, logContext);

      // 1️⃣ Mark as processing
      await prisma.dataForDocAnalysis.update({
        where: { id: analysisId },
        data: { status: "ML_PROCESSING" },
      });

      // 2️⃣ Fetch analysis + sensor + patient
      const analysis = await prisma.dataForDocAnalysis.findUnique({
        where: { id: analysisId },
        include: {
          sensorData: true,
          patient: true,
        },
      });

      if (!analysis || !analysis.patient || !analysis.sensorData) {
        throw new Error("Missing required Patient or Sensor data for analysis");
      }

      const { sensorData, patient } = analysis;

      // 3️⃣ Build ML payload
      const heightMeters = sensorData.height / 100;
      const bmi = Number(
        (sensorData.weight / (heightMeters * heightMeters)).toFixed(2)
      );

      const mlPayload = {
        hair_growth: patient.hairGrowth ? 1 : 0,
        skin_darkening: patient.skinDarkening ? 1 : 0,
        weight_gain: patient.weightGain ? 1 : 0,
        fast_food: patient.fastFood ? 1 : 0,
        cycle_length: patient.cycleLength,
        cycle_irregular: patient.cycleType === "IRREGULAR" ? 1 : 0,
        bmi,
        weight_kg: sensorData.weight,
        hip_inch: patient.hip,
      };

      logger.info('Payload constructed. Sending to ML Service...', logContext);

      // 4️⃣ Call ML service
      const mlResponse = await axios.post(
        process.env.ML_SERVICE_URL,
        mlPayload,
        { timeout: 8000 }
      );

      logger.info(`ML Service responded. Prediction: ${mlResponse.data.pcos_prediction}`, logContext);

      // 5️⃣ Save ML result
      await prisma.mLResult.create({
        data: {
          analysisId,
          prediction: mlResponse.data.pcos_prediction === 1 ? "PCOS" : "NO_PCOS",
          confidenceScore: mlResponse.data.confidence_score,
          modelVersion: "v1.1.2",
        },
      });

      // 6️⃣ Mark processed
      await prisma.dataForDocAnalysis.update({
        where: { id: analysisId },
        data: { status: "ML_PROCESSED" },
      });

      logger.info('Job completed successfully. Database updated.', logContext);

    } catch (error) {
      // 🚨 Error Handling
      logger.error(`Job Failed: ${error.message}`, logContext);

      // Update DB status to FAILED so UI doesn't hang
      try {
        await prisma.dataForDocAnalysis.update({
          where: { id: analysisId },
          data: { status: "PENDING" },
        });
        logger.warn('Analysis status set to ML_FAILED', logContext);
      } catch (dbError) {
        logger.error(`Critical: Could not update status to ML_FAILED. ${dbError.message}`, logContext);
      }
      
      throw error; // Throwing ensures BullMQ marks job as 'failed' in Redis
    }
  },
  { connection: redisConnection }
);

// Optional: Global Event Listeners for the Worker
worker.on('failed', (job, err) => {
  logger.error(`Worker reported failure for Job ${job.id}: ${err.message}`, { resource: 'Worker/ML_Queue' });
});

worker.on('error', (err) => {
  logger.error(`Redis connection error: ${err.message}`, { resource: 'Worker/ML_Queue' });
});

export default worker;