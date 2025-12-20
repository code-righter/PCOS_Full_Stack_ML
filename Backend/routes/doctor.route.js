import { getDocDashboardMetrics, getPendingPatientsData. getPatientInfo, getPatientTimeline } from "../controllers/doctor.controller";
import { Router } from "express";
import { verifyDoctor } from "../middleware/authDoctor.middleware";

const doctorRouter = Router()

doctorRouter.get('/dashboardMetrics', verifyDoctor, getDocDashboardMetrics)
doctorRouter.get('/pendingPatients', verifyDoctor, getPendingPatientsData)
doctorRouter.get('/allPatients', verifyDoctor, getPendingPatientsData)
doctorRouter.get('/patientInfo', verifyDoctor, getPatientTimeline);
