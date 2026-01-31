import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { getDb } from "./db.js";
import OpenAI from "openai";

const router = express.Router();
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post("/survey-chat", async (req, res) => {
  try {
    const db = getDb();
    const { survey, messages } = req.body;

    // --- Basic validation ---
    if (!survey || !Array.isArray(messages)) {
      return res.status(400).json({ message: "Invalid request payload" });
    }

    // --- Build prompt for Responses API ---
    const prompt = `
You are a friendly community survey assistant interviewing the user.
Greet the user and mention the town we're conducting the survey in.

RULES:

1. Ask EXACTLY ONE survey question at a time, in order.
2. You may ask up to THREE follow-up questions Try to always ask ATLEAST one.
   Follow-up questions MUST be asked immediately after the user's answer and BEFORE moving to the next predefined question.
3. After follow-ups, move to the next survey question But dont ask follow ups and next questions in the same prompt.
4. Even if the user says "skip" or "no", still move on.
5. NEVER answer for the user.
6. NEVER repeat answered questions.
7. If the question type is "multiple", output a JSON block immediately after the question containing:
   {
     "questionType": "multiple",
     "options": ["Option1", "Option2", ...]
   }
   This should appear right after the question text.

8. Always start predefined questions with:
   "Question X of Y:"
   
9. ONLY if all predefined questions and follow ups are completed explicitly say:
   "thank you for completing the survey"

INTERNAL METADATA (VERY IMPORTANT):
At the VERY TOP of your response, include exactly one line:
[PROGRESS question=X total=Y]

10. WHEN the survey is fully completed, ALSO append a FINAL JSON block containing the full structured survey result in the following format:
{
  "surveyResult": {
    "surveyTitle": "...",
    "responses": [
      {
        "question": "...",
+       "questionType": "text | multiple",
        "answer": "...",
+       "followUps": [
+         "follow-up question 1",
+         "follow-up question 2"
+       ],
+       "followUpAnswers": [
+         "answer to follow-up 1",
+         "answer to follow-up 2"
+       ]
      }
    ]
  }
}

Rules for this JSON:
- Include ALL predefined survey questions.
- If a question had no follow-up questions, use empty arrays.
- followUps and followUpAnswers MUST be the same length.
- Preserve the order in which follow-ups were asked.
- If a user skipped a follow-up, store its answer as null.
- This JSON must appear AFTER the thank-you message.

Survey definition:
${JSON.stringify(survey, null, 2)}

Conversation so far:
${messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}
    `.trim();

    // --- Call Responses API ---
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      temperature: 0.3,
      max_output_tokens: 1000
    });

    // --- Extract text safely ---
    const rawReply =
      response.output_text ||
      response.output?.[0]?.content
        ?.filter(c => c.type === "output_text")
        ?.map(c => c.text)
        ?.join("") ||
      "";

    if (!rawReply) throw new Error("Empty AI response");

    // --- Parse progress metadata ---
    const progressMatch = rawReply.match(/\[PROGRESS question=(\d+) total=(\d+)\]/);
    const progress = progressMatch
      ? {
          current: Number(progressMatch[1]),
          total: Number(progressMatch[2])
        }
      : null;

    // --- Remove metadata from message ---
    const cleanReply = rawReply.replace(/\[PROGRESS question=\d+ total=\d+\]\n?/, "");

    // --- Extract FINAL survey result JSON ---
    let finalSurveyResult = null;
    const finalSurveyMatch = cleanReply.match(
      /\{\s*"surveyResult"\s*:\s*\{[\s\S]*?\}\s*\}/
    );

    if (finalSurveyMatch) {
      try {
        finalSurveyResult = JSON.parse(finalSurveyMatch[0]).surveyResult;
      } catch {
        console.warn("Failed to parse final survey result JSON");
      }
    }

    // --- Completion check ---
    const surveyComplete =
      cleanReply.toLowerCase().includes("thank you for completing the survey") &&
      finalSurveyResult !== null;

    // --- Store structured survey result ---
    if (surveyComplete) {
      await db.collection("SurveyResponse").insertOne({
        surveyTitle: finalSurveyResult.surveyTitle || survey.title || "unknown",
        responses: finalSurveyResult.responses,
        progress,
        createdAt: new Date()
      });
    }

    // --- Parse multiple-choice JSON ---
    let aiData = null;
    const jsonMatch = cleanReply.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        aiData = JSON.parse(jsonMatch[0]);
      } catch {}
    }

    // --- Send to frontend ---
    res.json({
      reply: cleanReply.replace(/\{[\s\S]*\}/g, "").trim(),
      progress,
      surveyComplete,
      questionType: aiData?.questionType || "text",
      options: aiData?.options || null
    });

  } catch (err) {
    console.error("Survey chat error:", err);
    res.status(500).json({ message: "AI chat error" });
  }
});

export default router;
