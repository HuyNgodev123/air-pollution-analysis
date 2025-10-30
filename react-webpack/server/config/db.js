import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // nạp biến môi trường

const connectDB = async () => {
  try {
    console.log("🔍 MongoDB URI:", process.env.MONGODB_URI); // để kiểm tra
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
