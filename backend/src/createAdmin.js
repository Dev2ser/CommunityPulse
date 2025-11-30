import express from 'express';
import { getDb } from './db.js';

const router = express.Router();

router.post('/createAdmin', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const db = getDb();
    if (!db) {
      return res.status(500).json({ message: "Database not initialized" });
    }

    // Check if user already exists
    const existing = await db.collection('Admin').findOne({ username });
    if (existing) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Insert new admin
    await db.collection('Admin').insertOne({
      username,
      password,
      role
    });

    res.json({
      message: "Admin created successfully",
      createdUser: { username, role }
    });

  } catch (err) {
    console.error("CreateAdmin Route Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
