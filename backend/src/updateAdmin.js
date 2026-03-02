import express from "express";
import { getDb } from "./db.js";
import bcrypt from "bcrypt";

const router = express.Router();

router.put("/updateAdmin", async (req, res) => {
  try {
    const db = getDb();
    const { currentUsername, username, email, password } = req.body;

    if (!currentUsername) {
      return res.status(400).json({ message: "Current username is required" });
    }

    const updateFields = {};

    if (username) updateFields.username = username;
    if (email) updateFields.email = email;

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updateFields.password = hashed;
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const result = await db.collection("Admin").updateOne(
      { username: currentUsername },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Error updating admin:", err);
    res.status(500).json({ message: "Server error updating admin" });
  }
});

export default router;