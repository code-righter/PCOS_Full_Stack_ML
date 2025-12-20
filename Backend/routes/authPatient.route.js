import { Router } from "express";
import { signUpPatient, verifyOtpAndCreateAccount, signInPatient, signOutPatient, heartbeat } from "../controllers/authPatient.controller.js";
import { verifySession} from "../middleware/authPatient.middleware.js";
import { getPersonalInfo, setPersonalInfo } from "../controllers/patient.controller.js";

const authRouterPatient = Router()

// auth routes
authRouterPatient.post('/sign-up', signUpPatient)
authRouterPatient.post('/verifyEmail', verifyOtpAndCreateAccount);
authRouterPatient.post('/sign-in',  signInPatient)
authRouterPatient.post('/sign-out', signOutPatient)
authRouterPatient.post('/heartbeat',heartbeat)

// data routes 
authRouterPatient.get('/personalInfo', verifySession, getPersonalInfo);
authRouterPatient.post('/personalInfo', verifySession, setPersonalInfo);

export default authRouterPatient
