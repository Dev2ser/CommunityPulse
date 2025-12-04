import express from "express";
import { getDb } from "./db.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const emailInput = (req.body.email || "").trim();
    const password = req.body.password;

    if (!emailInput || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const email = emailInput.toLowerCase();
    const usernameLower = emailInput.toLowerCase();

    const db = getDb();
    if (!db) {
      return res.status(500).json({ message: "Database not initialized" });
    }

    const admin = await db.collection("Admin").findOne({
      password,
      $or: [
        { email },
        { username: emailInput },
        { username: usernameLower },
      ],
    });

    if (!admin) {
      return res.status(400).json({ message: "Invalid email or password" });
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
