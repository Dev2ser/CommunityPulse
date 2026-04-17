import express from "express";
import { ObjectId } from "mongodb";
import { getDb } from "./db.js";

const router = express.Router();
const SUPPORTED_QUESTION_TYPES = new Set([
  "text",
  "textarea",
  "multiple_choice",
  "checkbox",
  "dropdown",
]);
const OPTION_BASED_TYPES = new Set([
  "multiple_choice",
  "checkbox",
  "dropdown",
]);
const VALID_STATUSES = new Set(["draft", "published", "archived"]);
const LEGACY_TYPE_MAP = {
  multiple: "multiple_choice",
};

const normalizeBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;

  const normalized = String(value || "").trim().toLowerCase();
  if (["true", "yes", "y", "1"].includes(normalized)) return true;
  if (["false", "no", "n", "0", ""].includes(normalized)) return false;
  return false;
};

const normalizeQuestionType = (value) => {
  const normalized = String(value || "text").trim().toLowerCase();
  return LEGACY_TYPE_MAP[normalized] || normalized;
};

const sanitizeOptions = (options) => {
  if (!Array.isArray(options)) return [];
  return options
    .map((option) => String(option || "").trim())
    .filter(Boolean);
};

const normalizeQuestions = (questions = []) => {
  const errors = [];

  const normalizedQuestions = questions.map((question, index) => {
    const questionText = String(
      question?.questionText ?? question?.text ?? ""
    ).trim();
    const questionType = normalizeQuestionType(
      question?.questionType ?? question?.type
    );
    const required = normalizeBoolean(question?.required);
    const options = OPTION_BASED_TYPES.has(questionType)
      ? sanitizeOptions(question?.options)
      : [];

    if (!questionText) {
      errors.push(`Question ${index + 1}: questionText is required.`);
    }

    if (!SUPPORTED_QUESTION_TYPES.has(questionType)) {
      errors.push(
        `Question ${index + 1}: questionType must be one of ${[
          ...SUPPORTED_QUESTION_TYPES,
        ].join(", ")}.`
      );
    }

    if (OPTION_BASED_TYPES.has(questionType) && options.length === 0) {
      errors.push(
        `Question ${index + 1}: options are required for ${questionType}.`
      );
    }

    return {
      questionText,
      questionType,
      required,
      options,
      text: questionText,
      type: questionType,
    };
  });

  return {
    normalizedQuestions,
    errors,
  };
};

const buildSurveyPayload = (body, existingSurvey = null) => {
  const surveyTitle = String(
    body?.surveyTitle ?? body?.title ?? existingSurvey?.surveyTitle ?? ""
  ).trim();
  const description = String(
    body?.description ?? existingSurvey?.description ?? ""
  ).trim();
  const targetNeighborhood = String(
    body?.targetNeighborhood ?? existingSurvey?.targetNeighborhood ?? "all"
  ).trim() || "all";
  const status = String(body?.status ?? existingSurvey?.status ?? "draft").trim();
  const questions = Array.isArray(body?.questions)
    ? body.questions
    : existingSurvey?.questions || [];

  const errors = [];

  if (!surveyTitle) {
    errors.push("Survey title is required.");
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    errors.push("At least one question is required.");
  }

  if (!VALID_STATUSES.has(status)) {
    errors.push("Status must be draft, published, or archived.");
  }

  const { normalizedQuestions, errors: questionErrors } = normalizeQuestions(
    questions
  );

  return {
    errors: [...errors, ...questionErrors],
    payload: {
      surveyTitle,
      title: surveyTitle,
      description,
      targetNeighborhood,
      status,
      questions: normalizedQuestions,
    },
  };
};

// Create a new survey
router.post("/surveys", async (req, res) => {
  try {
    const { errors, payload } = buildSurveyPayload(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        message: errors[0],
        errors,
      });
    }

    const db = getDb();
    if (!db) return res.status(500).json({ message: "Database not initialized" });

    const doc = {
      ...payload,
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
    if (!db) return res.status(500).json({ message: "Database not initialized" });

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
    if (!db) return res.status(500).json({ message: "Database not initialized" });

    const surveys = await db
      .collection("Surveys")
      .find({ status: "published" })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ surveys });
  } catch (err) {
    console.error("List published surveys error:", err);
    res.status(500).json({ message: "Server error listing published surveys" });
  }
});

//List of published and archived surveys

router.get("/publishedAndArchivedSurveys", async (_req, res) => {
  try {
    const db = getDb();
    if (!db) return res.status(500).json({ message: "Database not initialized" });

    const surveys = await db
      .collection("Surveys")
      .find({ status: { $in: ["published", "archived"] } })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ surveys });
  } catch (err) {
    console.error("List published surveys error:", err);
    res.status(500).json({ message: "Server error listing published surveys" });
  }
});


// Publish Survey
router.post("/surveys/:id/publish", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid survey id" });

    const db = getDb();
    if (!db) return res.status(500).json({ message: "Database not initialized" });

    const result = await db
      .collection("Surveys")
      .updateOne({ _id: new ObjectId(id) }, { $set: { status: "published" } });

    if (result.matchedCount === 0) return res.status(404).json({ message: "Survey not found" });

    res.json({ message: "Survey published" });
  } catch (err) {
    console.error("Publish survey error:", err);
    res.status(500).json({ message: "Server error publishing survey" });
  }
});

// Archive Survey
router.post("/surveys/:id/archive", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid survey id" });

    const db = getDb();
    if (!db) return res.status(500).json({ message: "Database not initialized" });

    const result = await db
      .collection("Surveys")
      .updateOne({ _id: new ObjectId(id) }, { $set: { status: "archived" } });

    if (result.matchedCount === 0) return res.status(404).json({ message: "Survey not found" });

    res.json({ message: "Survey archived" });
  } catch (err) {
    console.error("Archive survey error:", err);
    res.status(500).json({ message: "Server error archiving survey" });
  }
});

// Delete a survey
router.delete("/surveys/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid survey id" });

    const db = getDb();
    if (!db) return res.status(500).json({ message: "Database not initialized" });

    const result = await db
      .collection("Surveys")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) return res.status(404).json({ message: "Survey not found" });

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
    if (!id || !ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid survey id" });

    const db = getDb();
    if (!db) return res.status(500).json({ message: "Database not initialized" });

    const existingSurvey = await db
      .collection("Surveys")
      .findOne({ _id: new ObjectId(id) });

    if (!existingSurvey) return res.status(404).json({ message: "Survey not found" });

    const { errors, payload } = buildSurveyPayload(req.body, existingSurvey);

    if (errors.length > 0) {
      return res.status(400).json({
        message: errors[0],
        errors,
      });
    }

    await db.collection("Surveys").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...payload,
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
