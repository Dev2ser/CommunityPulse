import express from 'express';
import { getDb } from './db.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const db = getDb();
    if (!db) {
      return res.status(500).json({ message: "Database not initialized" });
    }

    const admin = await db.collection('Admin').findOne({ username, password });

    if (!admin) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    res.json({
      message: 'Login successful',
      role: admin.role
    });

  } catch (err) {
    console.error("Login Route Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

