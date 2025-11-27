import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectToDb } from './db.js';
import adminLogin from './adminLogin.js';

dotenv.config();

const app = express();

// --- Middleware ---
app.use(morgan('dev'));
app.use(express.json());

// --- CORS ---
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
}));

// --- Routes ---
app.use('/api/admin', adminLogin);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to CommunityPulse API' });
});

// --- Start Server ---
const PORT = process.env.PORT || 5001;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  try {
    const dbInfo = await connectToDb();
    console.log("Database Connected:", dbInfo);
  } catch (err) {
    console.log("Database failed to connect, server still running.");
  }
});
