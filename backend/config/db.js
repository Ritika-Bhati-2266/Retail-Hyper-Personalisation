import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MOCK_DB_PATH = path.join(__dirname, '../data/mockDb.json');

export const dbState = {
  isMock: false
};

// Ensure mock db directory exists
const ensureMockDirectory = () => {
  const dir = path.dirname(MOCK_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(MOCK_DB_PATH)) {
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify({
      users: [],
      products: [],
      behaviors: [],
      offers: [],
      preferences: []
    }, null, 2));
  }
};

export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/retail-personalisation';
  try {
    console.log('Attempting to connect to MongoDB...');
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2000 // Timeout quickly to trigger fallback
    });
    console.log('MongoDB Connected Successfully.');
    dbState.isMock = false;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('--- FALLBACK ACTIVATED ---');
    console.log(`Using Local File Database: ${MOCK_DB_PATH}`);
    console.log('All operations will run locally on this JSON file.');
    console.log('---------------------------');
    ensureMockDirectory();
    dbState.isMock = true;
  }
};

export const getMockData = () => {
  ensureMockDirectory();
  try {
    const data = fs.readFileSync(MOCK_DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return { users: [], products: [], behaviors: [], offers: [], preferences: [] };
  }
};

export const saveMockData = (data) => {
  ensureMockDirectory();
  fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data, null, 2));
};
