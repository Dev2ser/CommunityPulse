import express from "express";
import bcrypt from "bcrypt";
import { getDb } from "./db.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const identifier = (req.body.email || req.body.username || "").trim();
    const password = req.body.password;

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: "Email/username and password are required" });
    }

    const email = identifier.toLowerCase();
    const db = getDb();

    if (!db) {
      return res.status(500).json({ message: "Database not initialized" });
    }

    // Find user by email OR username
    const admin = await db.collection("Admin").findOne({
      $or: [
        { email },
        { username: identifier },
        { username: email },
      ],
    });

    if (!admin) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Compare hashed password with bcrypt
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    res.json({
      message: "Login successful",
      role: admin.role,
      username: admin.username,
      email: admin.email || admin.username,
    });

  } catch (err) {
    console.error("Login Route Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
