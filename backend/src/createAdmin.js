import express from 'express';
import bcrypt from 'bcrypt';
import { getDb } from './db.js';

const router = express.Router();

router.post('/createAdmin', async (req, res) => {
  try {
    const username = req.body.username?.trim();
    const password = req.body.password;
    const role = req.body.role?.trim();
    const email = req.body.email?.trim();

    if (!username || !password || !role || !email) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const db = getDb();
    if (!db) {
      return res.status(500).json({ message: "Database not initialized" });
    }

    // Check if user already exists
    const existing = await db.collection('Admin').findOne({
      $or: [
        { username },
        { email: email.toLowerCase() }
      ]
    });

    if (existing) {
      return res.status(400).json({ message: "Username or email already exists" });
    }

    //Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new admin with hashed password
    await db.collection('Admin').insertOne({
      username,
      password: hashedPassword,   // 🔐 secure
      role,
      email: email.toLowerCase()
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

