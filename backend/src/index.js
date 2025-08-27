import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// ✅ Allow larger payloads (up to 10mb for images/base64 data)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cookieParser());

// ✅ Dynamic CORS for dev & production
const allowedOrigin =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5173"
    : process.env.VITE_BACKEND_URL
    ? process.env.VITE_BACKEND_URL.replace("/api", "") // remove /api if present
    : "*";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

// ✅ API routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// ✅ Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

// ✅ Start server
server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});
