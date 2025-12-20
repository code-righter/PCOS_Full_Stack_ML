import { Router } from "express";
import { signUpPatient, verifyOtpAndCreateAccount, signInPatient, signOutPatient, heartbeat } from "../controllers/authPatient.controller.js";
import { verifySession} from "../middleware/authPatient.middleware.js";

const authRouterPatient = Router()

// auth routes
authRouterPatient.post('/sign-up', signUpPatient)
authRouterPatient.post('/verifyEmail', verifyOtpAndCreateAccount);
authRouterPatient.post('/sign-in',  signInPatient)
authRouterPatient.post('/sign-out', signOutPatient)
authRouterPatient.post('/heartbeat', verifySession ,heartbeat)

export default authRouterPatient
