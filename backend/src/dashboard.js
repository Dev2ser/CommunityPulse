import express from "express";
import { getDb } from "./db.js";

const router = express.Router();

// Simple dashboard summary and recent items
router.get("/dashboard", async (_req, res) => {
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

    const totalSurveys = surveys.length;
    const publishedSurveys = surveys.filter(
      (s) => s.status === "published"
    ).length;
    const draftSurveys = surveys.filter((s) => s.status === "draft").length;
    const totalQuestions = surveys.reduce(
      (sum, s) => sum + (s.questions?.length || 0),
      0
    );

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekly = weekdays.map((day) => ({ day, count: 0 }));
    surveys.forEach((s) => {
      if (!s.createdAt) return;
      const d = new Date(s.createdAt);
      const idx = Number.isNaN(d.getDay()) ? null : d.getDay();
      if (idx !== null && weekly[idx]) {
        weekly[idx].count += 1;
      }
    });

    const recentActivity = surveys.slice(0, 5).map((s) => ({
      id: s._id,
      title: s.title || "Untitled survey",
      status: s.status || "draft",
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    res.json({
      totalSurveys,
      publishedSurveys,
      draftSurveys,
      totalQuestions,
      weekly,
      recentActivity,
    });
  } catch (err) {
    console.error("Dashboard route error:", err);
    res.status(500).json({ message: "Server error fetching dashboard data" });
  }
});

export default router;
