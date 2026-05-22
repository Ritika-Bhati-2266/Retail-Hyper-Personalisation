import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

// Load environment variables
dotenv.config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ------------------------
// DATABASE CONNECTION
// ------------------------
connectDB()
  .then(() => {
    console.log("✅ Database connected successfully");
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
    console.log("⚠️ Server will continue with fallback (if available)");
  });

// ------------------------
// ROUTES
// ------------------------
import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import behaviorsRouter from './routes/behaviors.js';
import offersRouter from './routes/offers.js';
import adminRouter from './routes/admin.js';

app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/behaviors', behaviorsRouter);
app.use('/api/offers', offersRouter);
app.use('/api/admin', adminRouter);

// ------------------------
// BASE ROUTE
// ------------------------
app.get('/', (req, res) => {
  res.json({
    message: 'Retail Hyper Personalisation API is running!',
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// ------------------------
// GLOBAL ERROR HANDLER
// ------------------------
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);

  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ------------------------
// START SERVER (IMPORTANT FOR RENDER)
// ------------------------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});