import mongoose from "mongoose";
import config from "./index";

export const connectToDatabase = async (): Promise<void> => {
  try {
    const mongoUri = config.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    await mongoose.connect(mongoUri);

    console.log("✅ MongoDB connected successfully");
  } catch (error: any) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};
