import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

// Load environmental variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Enable JSON parser & CORS middleware
app.use(express.json());
app.use(cors({
  origin: '*', // Allow all origins for testing/development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Connect to Database (Automatically handles Mongoose / JSON Mock Fallback)
await connectDB();

// Import routers
import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import behaviorsRouter from './routes/behaviors.js';
import offersRouter from './routes/offers.js';
import adminRouter from './routes/admin.js';

// Mount API router paths
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/behaviors', behaviorsRouter);
app.use('/api/offers', offersRouter);
app.use('/api/admin', adminRouter);

// Base route response
app.get('/', (req, res) => {
  res.json({
    message: 'Retail Hyper Personalisation API is running!',
    status: 'online',
    timestamp: new Date()
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    message: 'An unexpected internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Bind to Port
app.listen(PORT, () => {
  console.log(`Server successfully started on http://localhost:${PORT}`);
});
