import dotenv from 'dotenv'

dotenv.config()

const { PRODUCTION_APP_JWT_SECRET, PRODUCTION_MONGO_URI, PROD_PORT } =
  process.env;

console.log("Running in production mode");

export default {
  APP_JWT_SECRET: PRODUCTION_APP_JWT_SECRET,
  MONGO_URI: PRODUCTION_MONGO_URI,
  PORT: PROD_PORT,
};
