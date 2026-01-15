import dotenv from "dotenv";
dotenv.config();

import { Worker } from "bullmq";
import axios from "axios";
import prisma from "../db/prisma.js";
import { redisConnection } from "../queue/redis.js";

console.log("🚀 ML Worker started and listening to ML_QUEUE");

new Worker(
  "ML_QUEUE",
  async (job) => {
    const { analysisId } = job.data;
    const resource = "ML/Worker";

    try {
      console.log(`📥 [${resource}] Job received for analysisId: ${analysisId}`);

      // 1️⃣ Mark analysis as ML_PROCESSING
      await prisma.dataForDocAnalysis.update({
        where: { id: analysisId },
        data: { status: "ML_PROCESSING" },
      });

      // 2️⃣ Fetch analysis + test data (SINGLE SOURCE OF TRUTH)
      const analysis = await prisma.dataForDocAnalysis.findUnique({
        where: { id: analysisId },
        include: {
          testData: true,
        },
      });

      if (!analysis || !analysis.testData) {
        throw new Error("TestData not found for analysis");
      }

      const t = analysis.testData;

      // 3️⃣ Compute BMI safely
      const heightMeters = t.height ? t.height / 100 : null;
      const bmi =
        heightMeters && t.weight
          ? Number((t.weight / (heightMeters * heightMeters)).toFixed(2))
          : null;

      // 4️⃣ Build ML payload (STRICT CONTRACT)
      const mlPayload = {
        hair_growth: t.hairGrowth ? 1 : 0,
        skin_darkening: t.skinDarkening ? 1 : 0,
        weight_gain: t.weightGain ? 1 : 0,
        fast_food: t.fastFood ? 1 : 0,
        cycle_length: t.cycleLength,
        cycle_irregular: t.cycleType === "IRREGULAR" ? 1 : 0,
        bmi,
        weight_kg: t.weight,
        hip_inch: t.hip,
      };

      console.log(`📤 [${resource}] Sending payload to ML`, mlPayload);

      // 5️⃣ Call FastAPI ML service
      const mlResponse = await axios.post(
        process.env.ML_SERVICE_URL,
        mlPayload,
        {
          timeout: 8000,
          headers: {
            "x-api-key": process.env.ML_SERVICE_API_KEY,
          },
        }
      );

      const { pcos_prediction, confidence_score } = mlResponse.data;

      if (pcos_prediction === undefined || confidence_score === undefined) {
        throw new Error("Invalid ML response format");
      }

      // 6️⃣ Save ML result
      await prisma.mLResult.create({
        data: {
          analysisId,
          prediction: pcos_prediction === 1 ? "PCOS" : "NO_PCOS",
          confidenceScore: confidence_score,
          modelVersion: "v1.1.2", // default as decided
        },
      });

      // 7️⃣ Mark analysis as ML_PROCESSED
      await prisma.dataForDocAnalysis.update({
        where: { id: analysisId },
        data: { status: "ML_PROCESSED" },
      });

      console.log(
        `✅ [${resource}] ML processing completed for analysisId: ${analysisId}`
      );

    } catch (error) {
      console.error(
        `❌ [ML/Worker] Error for analysisId ${analysisId}:`,
        error.message
      );

      // 8️⃣ Mark analysis as ML_FAILED (important for visibility)
      await prisma.dataForDocAnalysis.update({
        where: { id: analysisId },
        data: { status: "ML_FAILED" },
      });

      // Re-throw so BullMQ retry mechanism kicks in
      throw error;
    }
  },
  {
    connection: redisConnection,
  }
);
