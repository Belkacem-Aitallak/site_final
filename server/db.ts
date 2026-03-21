import mongoose from "mongoose";

export const connectDB = async () => {
  console.log("🔥 DB FUNCTION CALLED");

  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB error:", error);
    process.exit(1);
  }
};
