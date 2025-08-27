import mongoose from "mongoose";

const MAX_RETRIES = 5;        // how many times to retry
const RETRY_INTERVAL = 5000;  // 5 seconds

export const connectDB = async (retries = 0) => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);

    if (retries < MAX_RETRIES) {
      console.log(
        `🔄 Retrying connection... (${retries + 1}/${MAX_RETRIES}) in ${RETRY_INTERVAL / 1000}s`
      );
      await new Promise((res) => setTimeout(res, RETRY_INTERVAL));
      return connectDB(retries + 1); // retry again
    } else {
      console.error("🚨 Could not connect to MongoDB after max retries. Exiting...");
      process.exit(1);
    }
  }
};
