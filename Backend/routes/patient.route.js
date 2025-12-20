import { Router } from "express";
import { verifySession } from "../middleware/authPatient.middleware.js";
import { getPatientTimeline, getPersonalData, setPersonalData} from "../controllers/patient.controller.js";

const patientRouter = Router()

patientRouter.get('/updateData', verifySession, getPersonalData);// get personal data update
patientRouter.post('/updateData', verifySession, setPersonalData);// set personal data update
patientRouter.post('/getRequestedData', verifySession, getPatientTimeline);  // patient history

export default patientRouter;
