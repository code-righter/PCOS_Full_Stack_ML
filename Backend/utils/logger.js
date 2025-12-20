import winston from 'winston';

const { combine, timestamp, printf, colorize, align } = winston.format;

// Custom Format: [Timestamp] [Level] [Context/Resource] Message
const logFormat = printf(({ level, message, timestamp, resource, method, route }) => {
  const httpInfo = method && route ? `[${method} ${route}] ` : '';
  const resourceInfo = resource ? `[${resource}] ` : '';
  
  return `${timestamp} ${level}: ${httpInfo}${resourceInfo}${message}`;
});

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    colorize({ all: true }), // Adds colors to the console output
    align(),
    logFormat
  ),
  transports: [
    new winston.transports.Console(),
    // new winston.transports.File({ filename: 'app.log' }), // Optional: save to file
  ],
});

export default logger;