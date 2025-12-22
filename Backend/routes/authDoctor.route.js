import { Router } from "express";
import { signInDoctor, signOutDoctor, signUpDoctor } from "../controllers/authDoctor.controller.js";
import {verifyDoctor} from '../middleware/authDoctor.middleware.js'
import { getDocDashboardMetrics, getPatientTimeline, getPendingPatientsData } from "../controllers/doctor.controller.js";

const authRouterDoctor = Router()

authRouterDoctor.post('/sign-up', signUpDoctor);
authRouterDoctor.post('/sign-in', signInDoctor)
authRouterDoctor.post('/sign-out', verifyDoctor, signOutDoctor)

export default authRouterDoctor;