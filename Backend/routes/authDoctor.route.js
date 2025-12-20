import { Router } from "express";
import { signInDoctor, signOutDoctor } from "../controllers/authDoctor.controller.js";
import { authorizeDoctor } from "../middleware/authDoctor.middleware.js";

const authRouterDoctor = Router()

authRouterDoctor.post('/sign-in', signInDoctor)
authRouterDoctor.get('/getPatient', )
authRouterDoctor.get('/getPatient', )
authRouterDoctor.get('/getPatient', )
authRouterDoctor.post('/sign-out', authorizeDoctor, signOutDoctor)

export default authRouterDoctor;