import express from 'express'
import cors from 'cors'
import morgan from 'morgan' // Import Morgan
import { PORT } from './config/env.js'
import authRouterPatient from './routes/authPatient.route.js'
import authRouterDoctor from './routes/authDoctor.route.js'
import prisma from './db/prisma.js'
import logger from './utils/logger.js' // Import your new Logger

const app = express()

// --- 1. MIDDLEWARE SETUP ---

app.use(express.json())
app.use(express.urlencoded({extended : false}))
app.use(cors())

// Configure Morgan to stream http logs to our Winston logger
// Format: Method URL Status ResponseTime
const morganFormat = ':method :url :status :response-time ms';

app.use(morgan(morganFormat, {
  stream: {
    write: (message) => {
      const parts = message.trim().split(' ');
      const [method, url, status, time] = parts;
      
      // Logs every incoming request automatically
      logger.info(`Status: ${status} | Time: ${time}`, { 
        resource: 'API-Gateway',
        method, 
        route: url 
      });
    },
  },
}));

// --- 2. ROUTES ---

app.get('/', (req, res) => {
    // Manual Log for specific logic
    logger.info('Dashboard health check initiated', { 
        resource: 'HealthCheck', 
        method: req.method,
        route: req.originalUrl
    });

    res.send({title : "This is PCOS Dashboard"})
})

app.get('/getUsers', async (req, res) => {
    try {
        logger.info('Querying database for user record', { resource: 'Database/Prisma' });
        
        const users = await prisma.user.findFirst();
        
        logger.info(`User found: ${users ? users.id : 'None'}`, { resource: 'Database/Prisma' });
        res.send(users);

    } catch (error) {
        // Log errors with high severity
        logger.error(error.message, { resource: 'Database/Prisma' });
        res.status(500).send({ error: "Internal Server Error" });
    }
})

// Mounting Routes
app.use('/api/v1/auth/patient', authRouterPatient);
app.use('/api/v1/patient', authRouterPatient);
app.use('api/v1/auth/doctor', authRouterDoctor);

// --- 3. SERVER START ---

app.listen(PORT, () => {
    // System level log
    logger.info(`Server started at http://localhost:${PORT}`, { resource: 'System' });
})

export default app;