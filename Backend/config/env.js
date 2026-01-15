import {config} from 'dotenv'

config({
  path: `.env`
});

export const { 
  PORT,
//   NODE_ENV, 
  DB_URL, 
  REDIS_URL
//   JWT_SECRET,
//   JWT_EXPIRES_IN,
//   DATABASE_URL
  
} = process.env; 