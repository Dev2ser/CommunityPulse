import express from "express";
import { getDb } from "./db.js";
import { extractResponses, getTopWords, getSentiment, getSuggestions } from "./analytics.js";

const router = express.Router();

router.get("/survey/responses/:surveyTitle", async (req, res) => {
  try {
    const db = getDb();
    const { surveyTitle } = req.params;

    if (!surveyTitle) return res.status(400).json({ message: "Survey title is required" });

    const surveys = await db.collection("SurveyResponse")
      .find({ surveyTitle })
      .toArray();

    if (!surveys.length) return res.status(404).json({ message: "Survey not found" });

    const responses = surveys.flatMap(s => extractResponses(s) || []);
    const topWords = responses.length ? getTopWords(responses) : [];
    const sentiment = responses.length ? getSentiment(responses) : "No data";
    const suggestions = topWords.length ? await getSuggestions(topWords) : [];

    const analyticsDoc = {
      surveyTitle,
      totalResponses: responses.length,
      sentiment,
      topWords,
      suggestions,

      createdAt: new Date()
    };
    await db.collection("SurveyAnalytics").insertOne(analyticsDoc);
    
    res.json(analyticsDoc);
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ message: "Analytics failed" });
  }
});

router.get("/survey/analytics/:surveyTitle", async (req, res) => {
  try {
    const db = getDb();
    const { surveyTitle } = req.params;

    if (!surveyTitle) return res.status(400).json({ message: "Survey title is required" });

    // Find analytics document
    const analytics = await db.collection("SurveyAnalytics").findOne({ surveyTitle });

    if (!analytics) {
      return res.status(404).json({ message: "Analytics not found. Generate report first." });
    }

    res.json(analytics);
  } catch (err) {
    console.error("Fetch analytics error:", err);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
});

export default router;
