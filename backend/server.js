import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ------------------------
// MIDDLEWARE
// ------------------------
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ------------------------
// FIXED DB PATH (RENDER + LOCAL SAFE)
// IMPORTANT: Render root = project root
// ------------------------
const dbPath = path.resolve("backend", "data", "mockDb.json");

// ------------------------
// READ DB SAFE
// ------------------------
const readDB = () => {
  try {
    if (!fs.existsSync(dbPath)) {
      console.error("❌ DB FILE NOT FOUND:", dbPath);
      return { users: [], products: [], behaviors: [], offers: [] };
    }

    const data = fs.readFileSync(dbPath, "utf-8");
    return JSON.parse(data || "{}");
  } catch (err) {
    console.error("❌ DB READ ERROR:", err.message);
    return { users: [], products: [], behaviors: [], offers: [] };
  }
};

// ------------------------
// HEALTH CHECK
// ------------------------
app.get("/", (req, res) => {
  res.json({
    message: "Retail Hyper Personalisation API is running!",
    status: "online",
    mode: "FILE_DB (NO MongoDB)",
    dbPath,
    timestamp: new Date().toISOString(),
  });
});

// ------------------------
// GET PRODUCTS
// ------------------------
app.get("/api/products", (req, res) => {
  const db = readDB();
  let products = db.products || [];

  const { category } = req.query;

  if (category) {
    products = products.filter(
      (p) => (p.category || "").toLowerCase() === category.toLowerCase()
    );
  }

  res.json(products);
});

// ------------------------
// SEARCH PRODUCTS (FIXED)
// ------------------------
app.get("/api/products/search", (req, res) => {
  const db = readDB();
  const products = db.products || [];

  const q = (req.query.q || "").trim().toLowerCase();

  if (!q) return res.json([]);

  const result = products.filter((p) =>
    (p.name || "").toLowerCase().includes(q)
  );

  res.json(result);
});

// ------------------------
// RECOMMENDATIONS
// ------------------------
app.get("/api/products/recommendations", (req, res) => {
  const db = readDB();
  const products = db.products || [];

  const shuffled = [...products]
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

  res.json(shuffled);
});

// ------------------------
// OFFERS
// ------------------------
app.get("/api/offers", (req, res) => {
  const db = readDB();

  res.json(
    db.offers || [
      { id: 1, title: "Flat 50% OFF", category: "Fashion" },
      { id: 2, title: "Buy 1 Get 1", category: "Electronics" },
    ]
  );
});

// ------------------------
// BEHAVIOR LOG
// ------------------------
app.post("/api/behaviors/log", (req, res) => {
  console.log("📊 Behavior logged:", req.body);

  res.json({
    success: true,
    segment: "new_users",
    affinity: {
      Electronics: 10,
      Fashion: 5,
    },
  });
});

// ------------------------
// START SERVER (IMPORTANT FOR RENDER)
// ------------------------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🟢 FILE DB MODE ACTIVE`);
  console.log(`📂 DB PATH: ${dbPath}`);
});