import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { getDb } from "./db.js";
import OpenAI from "openai";
import multer from "multer";

const router = express.Router();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const imageUpload = multer({ storage: multer.memoryStorage() });

router.post("/survey-chat", imageUpload.single("image"), async (req, res) => {
  try {
    const db = getDb();

    // --- Parse survey and messages safely ---
    let survey, parsedMessages;
    try {
      survey =
        typeof req.body.survey === "string"
          ? JSON.parse(req.body.survey)
          : req.body.survey;

      parsedMessages =
        typeof req.body.messages === "string"
          ? JSON.parse(req.body.messages)
          : req.body.messages;
    } catch (err) {
      return res
        .status(400)
        .json({ message: "Invalid JSON in survey or messages" });
    }

    // --- Basic validation ---
    if (!survey || !Array.isArray(parsedMessages)) {
      return res.status(400).json({ message: "Invalid request payload" });
    }

    // --- Handle uploaded image ---
    if (req.file) {
      const base64 = req.file.buffer.toString("base64");

      parsedMessages.push({
        role: "user",
        content: `[IMAGE: data:${req.file.mimetype};base64,${base64}]`,
      });
    }

    // --- Build prompt ---
    const prompt = `
You are a friendly community survey assistant interviewing the user.
Greet the user and mention the town we're conducting the survey in.

RULES:

1. Ask EXACTLY ONE survey question at a time, in order.
2. Ask 1–3 follow-up questions AFTER the user answers BEFORE moving on.
3. Never ask a new question and follow-ups in the same response.
4. Never repeat questions.
5. Always move forward even if user skips.
6. NEVER answer for the user.

7. Format for different question types:
- Multiple choice (single select):
{
  "questionType": "multiple_choice",
  "options": ["Option1", "Option2", "Option3"]
}
- Checkboxes (multi-select):
{
  "questionType": "checkbox",
  "options": ["Option1", "Option2", "Option3"]
}
- Dropdown (single select):
{
  "questionType": "dropdown",
  "options": ["Option1", "Option2", "Option3"]
}
- Text input:
{
  "questionType": "text"
}

8. Start questions with:
"Question X of Y:"

9. Image questions:
- Tell user they can upload ONE image
- Analyze it in detail
- Ask about it

10. Completion:
Say EXACTLY:
"thank you for completing the survey"

11. TOP LINE METADATA:
[PROGRESS question=X total=Y]

12. FINAL JSON AFTER COMPLETION:
{
  "surveyResult": {
    "surveyTitle": "...",
    "responses": [
      {
        "question": "...",
        "questionType": "text | multiple",
        "answer": "...",
        "followUps": [],
        "followUpAnswers": [],
        "imageAnalysis": "string or null"
      }
    ]
  }
}

Rules:
- Include ALL questions
- followUps + answers must match length
- Use null if skipped
- imageAnalysis = your own detailed visual description of the image ONLY nothing about what the user mentioned OR null

Survey:
${JSON.stringify(survey, null, 2)}

Conversation:
${parsedMessages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}
`.trim();

    // --- Call OpenAI ---
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      temperature: 0.3,
      max_output_tokens: 2000,
    });

    // --- Extract response text ---
    const rawReply =
      response.output_text ||
      response.output?.[0]?.content
        ?.filter((c) => c.type === "output_text")
        ?.map((c) => c.text)
        ?.join("") ||
      "";

    if (!rawReply) throw new Error("Empty AI response");

    // --- Extract progress ---
    const progressMatch = rawReply.match(
      /\[PROGRESS question=(\d+) total=(\d+)\]/,
    );

    const progress = progressMatch
      ? {
          current: Number(progressMatch[1]),
          total: Number(progressMatch[2]),
        }
      : null;

    // --- Remove metadata line ---
    const cleanReply = rawReply.replace(
      /\[PROGRESS question=\d+ total=\d+\]\n?/,
      "",
    );

    // --- Extract FINAL survey JSON using brace counting ---
    let finalSurveyResult = null;
    let finalSurveyMatch = null;

    // Find the position of "surveyResult"
    const surveyResultIndex = cleanReply.indexOf('"surveyResult"');
    if (surveyResultIndex !== -1) {
      // Find the opening brace before "surveyResult"
      let braceStartIndex = -1;
      for (let i = surveyResultIndex; i >= 0; i--) {
        if (cleanReply[i] === "{") {
          braceStartIndex = i;
          break;
        }
      }

      if (braceStartIndex !== -1) {
        // Count braces to find the matching closing brace
        let braceCount = 0;
        let braceEndIndex = -1;
        for (let i = braceStartIndex; i < cleanReply.length; i++) {
          if (cleanReply[i] === "{") braceCount++;
          if (cleanReply[i] === "}") braceCount--;
          if (braceCount === 0) {
            braceEndIndex = i;
            break;
          }
        }

        if (braceEndIndex !== -1) {
          finalSurveyMatch = cleanReply.substring(
            braceStartIndex,
            braceEndIndex + 1,
          );
          try {
            finalSurveyResult = JSON.parse(finalSurveyMatch).surveyResult;
            console.log("✅ Successfully parsed final survey JSON");
          } catch (err) {
            console.warn("Failed to parse final survey JSON:", err.message);
            console.log(
              "RAW JSON:",
              finalSurveyMatch.substring(0, 200) + "...",
            );
          }
        }
      }
    }

    const surveyComplete = finalSurveyResult !== null;

    console.log(
      "Survey complete flag:",
      surveyComplete,
      "Result:",
      !!finalSurveyResult,
    );

    // --- Store in DB ---
    if (finalSurveyResult !== null) {
      const dbTitle = survey.surveyTitle || survey.title || "unknown";
      console.log("📝 Survey complete. Saving to DB...");
      console.log("   Survey object keys:", Object.keys(survey));
      console.log("   Using surveyTitle:", dbTitle);
      console.log(
        "   Response count:",
        finalSurveyResult?.responses?.length || 0,
      );

      await db.collection("SurveyResponse").insertOne({
        surveyTitle: dbTitle,
        responses: Array.isArray(finalSurveyResult?.responses)
          ? finalSurveyResult.responses
          : [],
        progress,
        createdAt: new Date(),
      });
    }

    // --- Extract question type/options JSON BEFORE cleaning ---
    let aiData = null;
    let questionTypeMatch = null;

    // Find all JSON objects in the reply
    const allJsonMatches = cleanReply.matchAll(/\{[^}]*(?:\{[^}]*\}[^}]*)*\}/g);
    for (const match of allJsonMatches) {
      try {
        const parsed = JSON.parse(match[0]);
        // Check if this is a question type JSON (has questionType or options)
        if (parsed.questionType || parsed.options) {
          aiData = parsed;
          questionTypeMatch = match[0];
          break;
        }
      } catch {
        // Not valid JSON, skip
      }
    }

    // --- Clean reply: remove ALL JSON objects ---
    let replyText = cleanReply;
    // Remove surveyResult JSON if present
    if (finalSurveyMatch) {
      replyText = replyText.replace(finalSurveyMatch, "");
    }
    // Remove question type JSON if present
    if (questionTypeMatch) {
      replyText = replyText.replace(questionTypeMatch, "");
    }
    // Final trim and clean extra whitespace
    replyText = replyText.replace(/\s+/g, " ").trim();

    // --- Send response ---
    res.json({
      reply: replyText,
      progress,
      surveyComplete,
      questionType: aiData?.questionType || "text",
      options: aiData?.options || null,
    });
  } catch (err) {
    console.error(" Survey chat error:", err);
    res.status(500).json({ message: "AI chat error" });
  }
});

export default router;
