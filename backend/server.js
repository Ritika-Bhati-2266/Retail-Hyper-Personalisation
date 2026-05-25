import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ------------------------
// __dirname FIX (ES MODULE)
// ------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------------
// MIDDLEWARE
// ------------------------
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// ------------------------
// DATABASE CONNECTION
// ------------------------
connectDB()
  .then(() => {
    console.log("✅ Database initialized successfully");
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
  });

// ------------------------
// IMPORT ROUTERS
// ------------------------
import authRouter from "./routes/auth.js";
import productsRouter from "./routes/products.js";
import behaviorsRouter from "./routes/behaviors.js";
import offersRouter from "./routes/offers.js";
import adminRouter from "./routes/admin.js";

// ------------------------
// MOUNT API ROUTES
// ------------------------
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/behaviors", behaviorsRouter);
app.use("/api/offers", offersRouter);
app.use("/api/admin", adminRouter);

// ------------------------
// STATIC FRONTEND SERVE
// ------------------------
app.use(express.static(path.join(__dirname, "public")));

// ------------------------
// FRONTEND ROUTE WILD CARD (SPA)
// ------------------------
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ------------------------
// GLOBAL ERROR HANDLER
// ------------------------
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : {}
  });
});

// ------------------------
// START SERVER
// ------------------------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server successfully started on port ${PORT}`);
});