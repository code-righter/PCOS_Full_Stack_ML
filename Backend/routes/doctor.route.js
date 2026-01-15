import { getDocDashboardMetrics, getPendingPatientsData, getAllPatients, getCurrentPatientReviewRequest, updatePatientReport } from "../controllers/doctor.controller.js";
import { Router } from "express";
import { verifyDoctor } from "../middleware/authDoctor.middleware.js";

const doctorRouter = Router()

doctorRouter.get('/dashboardMetrics', verifyDoctor, getDocDashboardMetrics)
doctorRouter.get('/pendingPatients', verifyDoctor, getPendingPatientsData)
doctorRouter.get('/allPatients', verifyDoctor, getAllPatients)
doctorRouter.get('/patientInfo/:patientEmail', verifyDoctor, getCurrentPatientReviewRequest);
doctorRouter.post('/updatePatientReport/:analysisId', verifyDoctor, updatePatientReport);

// doctorRouter.post('/submitReport', verifyDoctor, submitDoctorsReport);

export default doctorRouter