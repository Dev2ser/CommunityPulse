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
Greet the user and and mention the town were conducting the survey on.

RULES:

1. Ask EXACTLY ONE survey question at a time, in order.
2. You may ask up to THREE follow-up questions.
3. After follow-ups, move to the next survey question.
4. Even if the user says "skip" or "no", still move on.
5. NEVER answer for the user.
6. NEVER repeat answered questions.
7. If the question type is "multiple", output a JSON block immediately after the question containing:
   {
     "questionType": "multiple",
     "options": ["Option1", "Option2", ...]
   }
   This should appear **right after the question text**. The frontend will parse this JSON to show clickable options.

8. Always start predefined questions with:
   "Question X of Y:"
   
9. ONLY if all predefined questions and follow ups are completed explicity say "thank you for completing the survey" as a flag for the frontend.

INTERNAL METADATA (VERY IMPORTANT):
At the VERY TOP of your response, include exactly one line:
[PROGRESS question=X total=Y]

This line is for internal use only. Do not explain it.

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
      max_output_tokens: 300
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

    if (progress) {
      console.log(`Survey progress: Question ${progress.current} of ${progress.total}`);
    } else {
      console.warn("Survey progress metadata missing");
    }


    let surveyComplete = false;

    // 1If AI explicitly says survey is done
    if (cleanReply.toLowerCase().includes("thank you for completing the survey")) {
      surveyComplete = true;
    }
    

    // --- Save to DB only when survey is complete ---
    if (surveyComplete) {
      await db.collection("SurveyResponse").insertOne({
        surveyId: survey._id || "unknown",
        messages: messages.concat({ role: "assistant", content: cleanReply }),
        progress,
        createdAt: new Date()
      });
      console.log("Survey response saved");
    }

   let aiData = null;
const jsonMatch = cleanReply.match(/\{[\s\S]*\}/); 
if (jsonMatch) {
  try {
    aiData = JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.warn("Failed to parse AI JSON block for options");
  }
}

// --- Send to frontend ---
res.json({
  reply: cleanReply.replace(/\{[\s\S]*\}/, "").trim(), // remove JSON from displayed text
  progress,
  surveyComplete,
  questionType: aiData?.questionType || "text",
  options: aiData?.options || null
});

  } catch (err) {
    console.error("Survey chat error:", err);
    console.error("OpenAI error details:", err?.response?.data);

    res.status(500).json({ message: "AI chat error" });
  }
});

export default router;
