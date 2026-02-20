import dotenv from 'dotenv'

dotenv.config()

const {
    DEV_APP_JWT_SECRET,
    DEV_MONGO_URI,
    DEV_PORT
} = process.env

console.log('Running in development mode')


export default {
    APP_JWT_SECRET: DEV_APP_JWT_SECRET,
    MONGO_URI:DEV_MONGO_URI,
    PORT: DEV_PORT
}