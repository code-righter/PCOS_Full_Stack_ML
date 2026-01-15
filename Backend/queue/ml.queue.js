import { Queue } from "bullmq";
import { redisConnection } from "./redis.js";

export const MLQueue = new Queue("ML_QUEUE", {
  connection: redisConnection,
});
