import { Router } from "express";
import { verifySession } from "../middleware/auth.middleware";
import { updatePatientData, getRequestedData} from "../controllers/updatePatient.controller";

const patientRouter = Router()

patientRouter.post('/updateData', verifySession, updatePatientData);
patientRouter.post('/getRequestedData', verifySession, getRequestedData);


