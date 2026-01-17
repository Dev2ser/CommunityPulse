import express from "express";
import { ObjectId } from "mongodb";
import { getDb } from "./db.js";

const router = express.Router();

// Create a new survey
router.post("/surveys", async (req, res) => {
  try {
    const {
      title,
      description = "",
      targetNeighborhood = "all",
      status = "draft",
      questions = [],
    } = req.body;

    if (!title || !Array.isArray(questions)) {
      return res
        .status(400)
        .json({ message: "Title and questions are required." });
    }

    const db = getDb();
    if (!db) {
      return res.status(500).json({ message: "Database not initialized" });
    }

    const cleanedQuestions = questions.map((q) => ({
      text: q.text || "",
      type: q.type || "text",
      allowImage: q.type === "text" ? !!q.allowImage : false,
      options:
        q.type === "multiple"
          ? (q.options || []).filter((opt) => opt && opt.trim().length > 0)
          : [],
    }));

    const doc = {
      title,
      description,
      targetNeighborhood,
      status,
      questions: cleanedQuestions,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("Surveys").insertOne(doc);

    res.json({
      message: "Survey created successfully",
      surveyId: result.insertedId,
    });
  } catch (err) {
    console.error("Create survey error:", err);
    res.status(500).json({ message: "Server error creating survey" });
  }
});

// List surveys
router.get("/surveys", async (_req, res) => {
  try {
    const db = getDb();
    if (!db) {
      return res.status(500).json({ message: "Database not initialized" });
    }

    const surveys = await db
      .collection("Surveys")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ surveys });
  } catch (err) {
    console.error("List surveys error:", err);
    res.status(500).json({ message: "Server error listing surveys" });
  }
});

// List of published surveys
router.get("/publishedSurveys", async (_req, res) => {
  try {
    const db = getDb();
    if (!db) {
      return res.status(500).json({ message: "Database not initialized" });
    }

    // Only get surveys where status is "published"
    const surveys = await db
      .collection("Surveys")
      .find({ status: "published" })  
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ surveys });
  } catch (err) {
    console.error("List surveys error:", err);
    res.status(500).json({ message: "Server error listing surveys" });
  }
});


// Delete a survey
router.delete("/surveys/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid survey id" });
    }

    const db = getDb();
    if (!db) {
      return res.status(500).json({ message: "Database not initialized" });
    }

    const result = await db
      .collection("Surveys")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Survey not found" });
    }

    res.json({ message: "Survey deleted" });
  } catch (err) {
    console.error("Delete survey error:", err);
    res.status(500).json({ message: "Server error deleting survey" });
  }
});

// Update a survey 
router.put("/surveys/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid survey id" });
    }

    const { title, questions = [] } = req.body;

    if (!title || !Array.isArray(questions)) {
      return res
        .status(400)
        .json({ message: "Title and questions are required." });
    }

    const db = getDb();
    if (!db) {
      return res.status(500).json({ message: "Database not initialized" });
    }

    // Fetch the current survey
    const existingSurvey = await db
      .collection("Surveys")
      .findOne({ _id: new ObjectId(id) });

    if (!existingSurvey) {
      return res.status(404).json({ message: "Survey not found" });
    }

    // Clean questions
    const cleanedQuestions = questions.map((q) => ({
      text: q.text || "",
      type: q.type || "text",
      allowImage: q.type === "text" ? !!q.allowImage : false,
      options:
        q.type === "multiple"
          ? (q.options || []).filter((opt) => opt && opt.trim().length > 0)
          : [],
    }));

  
    const result = await db.collection("Surveys").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title,
          questions: cleanedQuestions,
          updatedAt: new Date(),
        },
      }
    );

    res.json({ message: "Survey updated successfully" });
  } catch (err) {
    console.error("Update survey error:", err);
    res.status(500).json({ message: "Server error updating survey" });
  }
});


export default router;
