import express from 'express';
import { getDb } from './db.js';

const router = express.Router();


router.get('/', async (req, res) => {
  try {
    const db = getDb();
    if (!db) return res.status(500).json({ message: "Database not initialized" });

    // Fetch all admins, hide passwords
    const admins = await db
      .collection('Admin')
      .find({}, { projection: { password: 0 } }) // hide passwords
      .toArray();

    res.json(admins);
  } catch (err) {
    console.error("Fetch Admins Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
