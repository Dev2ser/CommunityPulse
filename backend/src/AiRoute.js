import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { getDb } from "./db.js";
import OpenAI from "openai";
import multer from "multer";

const router = express.Router();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
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
        content: `[IMAGE: data:${req.file.mimetype};base64,${base64}]`
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

7. Multiple choice format:
{
  "questionType": "multiple",
  "options": ["Option1", "Option2"]
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
${parsedMessages
  .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
  .join("\n")}
`.trim();

    // --- Call OpenAI ---
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      temperature: 0.3,
      max_output_tokens: 2000
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
      /\[PROGRESS question=(\d+) total=(\d+)\]/
    );

    const progress = progressMatch
      ? {
          current: Number(progressMatch[1]),
          total: Number(progressMatch[2])
        }
      : null;

    // --- Remove metadata line ---
    const cleanReply = rawReply.replace(
      /\[PROGRESS question=\d+ total=\d+\]\n?/,
      ""
    );

    // --- Extract FINAL survey JSON (FIXED NON-GREEDY) ---
    let finalSurveyResult = null;

    const finalSurveyMatch = cleanReply.match(
      /\{\s*"surveyResult"\s*:\s*\{[\s\S]*?\}\s*\}/
    );

    if (finalSurveyMatch) {
      try {
        finalSurveyResult = JSON.parse(finalSurveyMatch[0]).surveyResult;
      } catch (err) {
        console.warn("Failed to parse final survey JSON");
        console.log("RAW JSON:", finalSurveyMatch[0]);
      }
    }


    const surveyComplete =
      finalSurveyResult !== null &&
      /thank you.*survey/i.test(cleanReply);

    // --- Store in DB ---
    if (surveyComplete) {
      console.log(" Survey complete. Saving to DB...");
      await db.collection("SurveyResponse").insertOne({
        surveyTitle:
          finalSurveyResult.surveyTitle || survey.title || "unknown",
        responses: finalSurveyResult.responses,
        progress,
        createdAt: new Date()
      });
    }

    // --- Extract multiple choice JSON ---
    let aiData = null;
    const jsonMatch = cleanReply.match(/\{[\s\S]*?\}/);

    if (jsonMatch) {
      try {
        aiData = JSON.parse(jsonMatch[0]);
      } catch {}
    }

    // --- Send response ---
    res.json({
      reply: cleanReply.replace(/\{[\s\S]*?\}/g, "").trim(),
      progress,
      surveyComplete,
      questionType: aiData?.questionType || "text",
      options: aiData?.options || null
    });

  } catch (err) {
    console.error(" Survey chat error:", err);
    res.status(500).json({ message: "AI chat error" });
  }
});

export default router;