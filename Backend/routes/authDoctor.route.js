import { Router } from "express";
import { signInDoctor, signOutDoctor } from "../controllers/authDoctor.controller.js";
import {verifyDoctor} from '../middleware/authDoctor.middleware.js'
import { getDocDashboardMetrics, getPatientTimeline, getPendingPatientsData } from "../controllers/doctor.controller.js";

const authRouterDoctor = Router()

authRouterDoctor.post('/sign-in', signInDoctor)
authRouterDoctor.post('/sign-out', verifyDoctor, signOutDoctor)

export default authRouterDoctor;