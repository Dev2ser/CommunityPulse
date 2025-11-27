import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import adminLogin from './adminLogin.js';

dotenv.config();
const app = express();

// CORS - Allow ALL origins
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/admin', adminLogin);

// Root route
app.get('/', (req, res) => res.json({ message: 'Welcome to CommunityPulse API' }));

// Database connection
const connectDB = async () => {
  try {
    const connectionString = process.env.MONGODB_URI;
    console.log(` Attempting to connect to: ${connectionString}`);
    
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(connectionString);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(` MongoDB Connection Error: ${error.message}`);
    console.log(' Server will continue without database');
  }
};

// Start server FIRST, then connect to DB
const PORT = process.env.PORT || 5001;

app.listen(PORT, async () => {
  // Connect to DB after server starts
  await connectDB();
});