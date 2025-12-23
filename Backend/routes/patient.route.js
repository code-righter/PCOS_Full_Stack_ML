import { Router } from "express";
import { verifySession } from "../middleware/authPatient.middleware.js";
import { getPatientTimeline, getPersonalData, setPersonalData, generateCode, getLiveSensorData, receiveSensorData, saveSensorData, getPendingRequests} from "../controllers/patient.controller.js";

const patientRouter = Router()

patientRouter.get('/personalInfo', verifySession, getPersonalData);// get personal data update
patientRouter.post('/updateData', verifySession, setPersonalData);// set personal data update
patientRouter.post('/history', verifySession, getPatientTimeline);  // patient history
patientRouter.get('/getPendingRequests', verifySession, getPendingRequests);  // patient history


// Test from frontend 
patientRouter.get('/test/generateCode', verifySession, generateCode);  // Generate Code
patientRouter.get('/test/getLiveSensorData/:code', verifySession, getLiveSensorData);  // Check sensor data status polls every 3 seconds  
patientRouter.post('/test/submit', verifySession, saveSensorData);  // Submitting Test Data

// Data from Hardware
patientRouter.post('/test/receiveSensorData',  receiveSensorData);

export default patientRouter;
