import express from "express";
import { getDb } from "./db.js";

const router = express.Router(); 

router.post("/login", async (req, res) => {
  try {
    const identifier = (req.body.email || req.body.username || "")
      .trim()
      .toLowerCase();
    const password = req.body.password?.trim();

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: "Email/username and password are required" });
    }

    const db = getDb();
    if (!db) {
      return res.status(500).json({ message: "Database not initialized" });
    }

    const admin = await db.collection("Admin").findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!admin || admin.password !== password) {
      return res
        .status(400)
        .json({ message: "Invalid username or password" });
    }

    res.json({
      message: "Login successful",
      role: admin.role,
    });
  } catch (err) {
    console.error("Login Route Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
