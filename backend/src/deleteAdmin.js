import express from "express";
import { getDb } from "./db.js";
import { ObjectId } from "mongodb";

const router = express.Router();

router.delete("/deleteAdmin/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    console.log("[deleteAdmin] requested id:", id);

    if (!id) {
      return res.status(400).json({ message: "Admin id is required" });
    }

    const collection = db.collection("Admin");

    let result;

    
    if (ObjectId.isValid(id)) {
      result = await collection.deleteOne({ _id: new ObjectId(id) });
      console.log("[deleteAdmin] ObjectId attempt result:", result);
    }

    if (!result || result.deletedCount === 0) {
      result = await collection.deleteOne({ _id: id });
      console.log("[deleteAdmin] string id attempt result:", result);
    }

    if (!result || result.deletedCount === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    console.log("[deleteAdmin] Admin deleted successfully");
    return res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error("Error deleting admin:", error);
    return res.status(500).json({ message: "Server error deleting admin" });
  }
});

export default router;