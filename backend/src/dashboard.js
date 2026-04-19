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

    const surveyResponses = await db
      .collection("SurveyResponse")
      .find({}, { projection: { surveyTitle: 1, createdAt: 1 } })
      .toArray();

    const totalSurveys = surveys.length;
    const publishedSurveys = surveys.filter(
      (s) => s.status === "published",
    ).length;
    const draftSurveys = surveys.filter((s) => s.status === "draft").length;
    const totalQuestions = surveys.reduce(
      (sum, s) => sum + (s.questions?.length || 0),
      0,
    );

    // Day-by-day response counts for the last 7 calendar days (chronological).
    const toDateKey = (date) => {
      const year = date.getFullYear();
      const month = `${date.getMonth() + 1}`.padStart(2, "0");
      const day = `${date.getDate()}`.padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const weekStart = new Date(todayStart);
    weekStart.setDate(todayStart.getDate() - 6);

    const weeklyBuckets = [];
    for (let i = 0; i < 7; i += 1) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);

      weeklyBuckets.push({
        key: toDateKey(d),
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        count: 0,
      });
    }

    const weeklyMap = new Map(
      weeklyBuckets.map((bucket) => [bucket.key, bucket]),
    );

    surveyResponses.forEach((responseDoc) => {
      const createdAt = responseDoc?.createdAt
        ? new Date(responseDoc.createdAt)
        : null;
      if (!createdAt || Number.isNaN(createdAt.getTime())) return;

      const key = toDateKey(createdAt);
      const bucket = weeklyMap.get(key);
      if (bucket) bucket.count += 1;
    });

    const weekly = weeklyBuckets.map(({ day, count }) => ({ day, count }));

    const recentActivity = surveys.slice(0, 5).map((s) => ({
      id: s._id,
      surveyTitle: s.surveyTitle || "Untitled survey",
      status: s.status || "draft",
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    const totalResponses = surveyResponses.length;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const responsesThisWeek = surveyResponses.reduce((count, responseDoc) => {
      const created = responseDoc?.createdAt
        ? new Date(responseDoc.createdAt)
        : null;
      if (!created || Number.isNaN(created.getTime())) return count;
      return created >= weekAgo ? count + 1 : count;
    }, 0);

    const surveyCreatedAtByTitle = new Map();
    surveys.forEach((survey) => {
      const title = survey?.surveyTitle;
      const createdAt = survey?.createdAt ? new Date(survey.createdAt) : null;
      if (!title || !createdAt || Number.isNaN(createdAt.getTime())) return;
      surveyCreatedAtByTitle.set(title, createdAt);
    });

    const responseCountBySurveyTitle = new Map();
    let totalResponseDelayMs = 0;
    let responseDelaySamples = 0;

    surveyResponses.forEach((responseDoc) => {
      const title = responseDoc?.surveyTitle;
      if (!title) return;

      responseCountBySurveyTitle.set(
        title,
        (responseCountBySurveyTitle.get(title) || 0) + 1,
      );

      const responseCreatedAt = responseDoc?.createdAt
        ? new Date(responseDoc.createdAt)
        : null;
      const surveyCreatedAt = surveyCreatedAtByTitle.get(title);
      if (!responseCreatedAt || !surveyCreatedAt) return;
      if (Number.isNaN(responseCreatedAt.getTime())) return;

      const diff = responseCreatedAt.getTime() - surveyCreatedAt.getTime();
      if (diff < 0) return;

      totalResponseDelayMs += diff;
      responseDelaySamples += 1;
    });

    const avgResponseDelayMs =
      responseDelaySamples > 0
        ? Math.round(totalResponseDelayMs / responseDelaySamples)
        : null;

    const publishedSurveyDocs = surveys.filter(
      (survey) => survey?.status === "published",
    );
    const completedPublishedSurveys = publishedSurveyDocs.filter(
      (survey) => (responseCountBySurveyTitle.get(survey.surveyTitle) || 0) > 0,
    ).length;

    const completionRate =
      publishedSurveyDocs.length > 0
        ? (completedPublishedSurveys / publishedSurveyDocs.length) * 100
        : null;

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const getMonthlyCompletionRate = (startDate, endDate) => {
      const monthPublished = publishedSurveyDocs.filter((survey) => {
        const createdAt = survey?.createdAt ? new Date(survey.createdAt) : null;
        if (!createdAt || Number.isNaN(createdAt.getTime())) return false;
        return createdAt >= startDate && createdAt < endDate;
      });

      if (monthPublished.length === 0) return null;

      const monthCompleted = monthPublished.filter(
        (survey) =>
          (responseCountBySurveyTitle.get(survey.surveyTitle) || 0) > 0,
      ).length;

      return (monthCompleted / monthPublished.length) * 100;
    };

    const completionRateThisMonth = getMonthlyCompletionRate(
      startOfThisMonth,
      now,
    );
    const completionRateLastMonth = getMonthlyCompletionRate(
      startOfLastMonth,
      startOfThisMonth,
    );

    const completionRateDeltaFromLastMonth =
      completionRateThisMonth !== null && completionRateLastMonth !== null
        ? completionRateThisMonth - completionRateLastMonth
        : null;

    res.json({
      totalSurveys,
      publishedSurveys,
      draftSurveys,
      totalQuestions,
      totalResponses,
      responsesThisWeek,
      avgResponseDelayMs,
      completionRate,
      completionRateDeltaFromLastMonth,
      weekly,
      recentActivity,
    });
  } catch (err) {
    console.error("Dashboard route error:", err);
    res.status(500).json({ message: "Server error fetching dashboard data" });
  }
});

export default router;
