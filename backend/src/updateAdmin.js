import express from "express";
import { getDb } from "./db.js";
import { ObjectId } from "mongodb";

const router = express.Router();


router.put("/updateAdmin/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const { username, role, email } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Admin ID is required" });
    }

    if (!username && !role && !email) {
      return res
        .status(400)
        .json({ message: "Nothing to update. Provide username, email, or role." });
    }

    const updateFields = {};
    if (username) updateFields.username = username;
    if (role) updateFields.role = role;
    if (email) updateFields.email = email;

    const result = await db
      .collection("Admin")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateFields });

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({ message: "Admin updated successfully" });
  } catch (err) {
    console.error("Error updating admin:", err);
    res.status(500).json({ message: "Server error updating admin" });
  }
});

export default router;
