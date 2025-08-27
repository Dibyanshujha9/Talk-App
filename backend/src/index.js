import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5001;

// ✅ Allow larger payloads (up to 10mb for images/base64 data)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cookieParser());

// ✅ Dynamic CORS for dev & production
const allowedOrigin =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5173"
    : process.env.FRONTEND_URL || "*";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

// ✅ API routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// ❌ Removed serving frontend (because frontend is deployed separately)

// ✅ Start server AFTER DB connection
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`✅ Server running on PORT: ${PORT}`);
  });
});
