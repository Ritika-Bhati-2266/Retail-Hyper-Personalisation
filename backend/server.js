import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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
  })
);

// ------------------------
// DB PATH
// ------------------------
const dbPath = path.join(__dirname, "data", "mockDb.json");

// ------------------------
// READ DB SAFE
// ------------------------
const readDB = () => {
  try {
    if (!fs.existsSync(dbPath)) {
      console.error("DB NOT FOUND:", dbPath);
      return { products: [], offers: [], users: [] };
    }

    const data = fs.readFileSync(dbPath, "utf-8");
    return JSON.parse(data || "{}");
  } catch (err) {
    console.error("DB ERROR:", err.message);
    return { products: [], offers: [], users: [] };
  }
};

// ------------------------
// STATIC FRONTEND (IMPORTANT)
// ------------------------
app.use(express.static(path.join(__dirname, "public")));

// ------------------------
// API ROUTES
// ------------------------
app.get("/api/products", (req, res) => {
  const db = readDB();
  res.json(db.products || []);
});

app.get("/api/products/search", (req, res) => {
  const db = readDB();
  const q = (req.query.q || "").toLowerCase();

  const result = (db.products || []).filter((p) =>
    p.name.toLowerCase().includes(q)
  );

  res.json(result);
});

app.get("/api/products/recommendations", (req, res) => {
  const db = readDB();

  const shuffled = [...(db.products || [])]
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

  res.json(shuffled);
});

app.get("/api/offers", (req, res) => {
  const db = readDB();
  res.json(db.offers || []);
});

// ------------------------
// FRONTEND ROUTE FIX (IMPORTANT)
// ------------------------
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ------------------------
// START SERVER
// ------------------------
app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on port", PORT);
  console.log("📂 DB:", dbPath);
});