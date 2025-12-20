import { getDocDashboardMetrics, getPendingPatientsData, getPatientTimeline } from "../controllers/doctor.controller.js";
import { Router } from "express";
import { verifyDoctor } from "../middleware/authDoctor.middleware.js";

const doctorRouter = Router()

doctorRouter.get('/dashboardMetrics', verifyDoctor, getDocDashboardMetrics)
doctorRouter.get('/pendingPatients', verifyDoctor, getPendingPatientsData)
doctorRouter.get('/allPatients', verifyDoctor, getPendingPatientsData)
doctorRouter.get('/patientInfo', verifyDoctor, getPatientTimeline);

export default doctorRouter