import express from "express";
import { getDb } from "./db.js";
import { extractResponses, getTopWords, getSentiment, getSuggestions, getCategories} from "./analytics.js";

const router = express.Router();

router.get("/survey/responses/:surveyTitle", async (req, res) => {
  try {
    const db = getDb();
    const { surveyTitle } = req.params;

    if (!surveyTitle) {
      return res.status(400).json({ message: "Survey title is required" });
    }

    const surveys = await db
      .collection("SurveyResponse")
      .find({ surveyTitle })
      .toArray();

    if (!surveys.length) {
      return res.status(404).json({ message: "Survey not found" });
    }

    const responses = surveys.flatMap(s => extractResponses(s) || []);
    const topWords = responses.length ? getTopWords(responses) : [];
    const categories = topWords.length ? await getCategories(topWords) : [];
    const sentiment = responses.length ? getSentiment(responses) : { score: 0, label: "No data" };
    const suggestions = topWords.length ? await getSuggestions(topWords) : [];
    
    await db.collection("SurveyAnalytics").updateOne(
      { surveyTitle },
      {
        $set: {
          totalResponses: responses.length,
          sentimentScore: sentiment.score,  
          sentimentLabel: sentiment.label, 
          topWords,
          suggestions,
          categories,
          updatedAt: new Date()
        },
        $setOnInsert: {
          surveyTitle,
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    const analyticsDoc = await db
      .collection("SurveyAnalytics")
      .findOne({ surveyTitle });

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
router.get("/survey/categories/count/:surveyTitle", async (req, res) => {
  try {
    const db = getDb();
    const { surveyTitle } = req.params;

    if (!surveyTitle) {
      return res.status(400).json({ message: "Survey title is required" });
    }

    // Find the analytics document
    const analytics = await db.collection("SurveyAnalytics").findOne({ surveyTitle });

    if (!analytics) {
      return res.status(404).json({ message: "Analytics not found for this survey" });
    }

    // Count the categories
    const categoryCount = Array.isArray(analytics.categories) ? analytics.categories.length : 0;

    res.json({
      surveyTitle,
      categoryCount
    });
  } catch (err) {
    console.error("Get category count error:", err);
    res.status(500).json({ message: "Failed to get category count" });
  }
});

router.get("/survey/themes/:surveyTitle", async (req, res) => {
  try {
    const db = getDb();
    const { surveyTitle } = req.params;

    if (!surveyTitle) {
      return res.status(400).json({ message: "Survey title is required" });
    }

    // Find the analytics document for this survey
    const analytics = await db.collection("SurveyAnalytics").findOne({ surveyTitle });

    if (!analytics || !Array.isArray(analytics.topWords)) {
      return res.status(404).json({ message: "No themes found for this survey" });
    }

    // Sort topWords by count descending and grab top 10
    const themes = analytics.topWords
      .filter(wordObj => wordObj.word) // remove empty objects
      .sort((a, b) => b.count - a.count) // sort descending
      .slice(0, 10) // top 10
      .map((wordObj) => ({
        word: wordObj.word,
        count: wordObj.count || 0
      }));

    res.json({ surveyTitle, themes });
  } catch (err) {
    console.error("Get themes error:", err);
    res.status(500).json({ message: "Failed to get themes" });
  }
});

router.get("/survey/multipleCounts/:surveyTitle", async (req, res) => {
  try {
    const db = getDb();
    const { surveyTitle } = req.params;

    if (!surveyTitle) {
      return res.status(400).json({ message: "Survey title is required" });
    }

    const surveyResponses = await db
      .collection("SurveyResponse")
      .find({ surveyTitle })
      .toArray();

    if (!surveyResponses.length) {
      return res.status(404).json({ message: "No responses found for this survey" });
    }

    const multipleCounts = {};
    const questions = [];

    surveyResponses.forEach((responseDoc) => {
      const responses = responseDoc.responses || [];

      responses.forEach((q) => {
        if (q.questionType === "multiple" && q.answer) {
          if (!multipleCounts[q.question]) {
            multipleCounts[q.question] = {};
            questions.push(q.question); 
          }

          multipleCounts[q.question][q.answer] =
            (multipleCounts[q.question][q.answer] || 0) + 1;
        }
      });
    });

    res.json({ 
      surveyTitle, 
      questions,        
      multipleCounts 
    });
  } catch (err) {
    console.error("Multiple choice counts error:", err);
    res.status(500).json({ message: "Failed to get multiple-choice counts" });
  }
});

// Get image responses and analysis for a survey
router.get("/survey/imageResponses/:surveyTitle", async (req, res) => {
  try {
    const db = getDb();
    const { surveyTitle } = req.params;

    const surveyResponses = await db
      .collection("SurveyResponse")
      .find({ surveyTitle })
      .toArray();

    if (!surveyResponses.length) {
      return res.status(404).json({ message: "No responses found" });
    }

    const imageMap = {}; // group by question

    surveyResponses.forEach((doc) => {
      const responses = doc.responses || [];

      responses.forEach((q) => {
        if (q.questionType === "image") {
          const questionText = q.question;

          if (!imageMap[questionText]) {
            imageMap[questionText] = [];
          }

          
          if (q.imageAnalysis) {
            imageMap[questionText].push({
              analysis: q.imageAnalysis,   
              createdAt: doc.createdAt,
            });
          }
        }
      });
    });

    const formatted = Object.keys(imageMap).map((question) => ({
      question,
      responses: imageMap[question],
    }));

    res.json({
      surveyTitle,
      imageData: formatted,
    });

  } catch (err) {
    console.error("Image responses error:", err);
    res.status(500).json({ message: "Failed to fetch image responses" });
  }
});

// response count for all surveys
router.get("/survey/responseCountAll", async (req, res) => {
  try {
    const db = getDb();

    const counts = await db
      .collection("SurveyResponse")
      .aggregate([
        {
          $group: {
            _id: "$surveyTitle",
            totalResponses: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            surveyTitle: "$_id",
            totalResponses: 1
          }
        }
      ])
      .toArray();

    res.json({ surveys: counts });
  } catch (err) {
    console.error("Response count all error:", err);
    res.status(500).json({ message: "Failed to get response counts" });
  }
});

//response count per survey
router.get("/survey/responseCount/:surveyTitle", async (req, res) => {
  try {
    const db = getDb();
    const { surveyTitle } = req.params;

    if (!surveyTitle) {
      return res.status(400).json({ message: "Survey title is required" });
    }

    // Count documents in SurveyResponse for this survey
    const count = await db
      .collection("SurveyResponse")
      .countDocuments({ surveyTitle });

    res.json({ surveyTitle, totalResponses: count });
  } catch (err) {
    console.error("Response count error:", err);
    res.status(500).json({ message: "Failed to get response count" });
  }
});

 // Get flattened responses and follow-ups by Survey Title
router.get("/survey/responsesAndFollowups/:surveyTitle", async (req, res) => {
  try {
    const db = getDb();
    const { surveyTitle } = req.params;

    if (!surveyTitle) {
      return res.status(400).json({ message: "Survey title is required" });
    }

    const surveyResponses = await db
      .collection("SurveyResponse")
      .find({ surveyTitle })
      .toArray();

    if (!surveyResponses.length) {
      return res.status(404).json({ message: "No responses found for this survey" });
    }

    // Flatten the responses
    const flattenedRows = surveyResponses.flatMap((responseDoc) => {
      const responseId = responseDoc._id.toString();


      const topResponses = (responseDoc.responses || []).map((r) => ({
        surveyTitle,
        responseId,
        question: r.question,
        answer: r.answer,
        questionType: r.questionType,

        
      }));

      const followUpRows = (responseDoc.followUps || []).flatMap((fu) =>
        (fu.followUpAnswers || []).map((fua) => ({
          surveyTitle,
          responseId,
          question: fua.question,
          answer: fua.answer,
          questionType: fua.questionType,

        }))
      );

      return [...topResponses, ...followUpRows];
    });

    res.json({ surveyTitle, rows: flattenedRows });
  } catch (err) {
    console.error("Get responses and follow-ups error:", err);
    res.status(500).json({ message: "Failed to get responses and follow-ups" });
  }
});

export default router;