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

    // --- STRICT DETERMINISTIC PROMPT ---
    const prompt = `
You are a friendly community survey assistant interviewing the user.

Your job is to ask survey questions in a strict, controlled sequence.
You MUST follow all rules exactly. If you break a rule, your response is INVALID.

====================
ABSOLUTE RULES
====================

1. Ask EXACTLY ONE predefined survey question at a time, in the order provided.
2. Predefined survey questions increment progress.
3. Follow-up questions DO NOT increment progress.
4. You may ask up to THREE follow-up questions per predefined survey question.
5. After follow-ups (or sooner if appropriate), MOVE ON to the NEXT predefined question.
6. Even if the user says "skip", "no", repeats themselves, or gives no new information,
   you MUST continue until all predefined survey questions are asked.
7. NEVER answer for the user.
8. NEVER repeat a predefined survey question once it has been answered.
9. NEVER end the survey early.
10. NEVER thank the user for completing the survey unless explicitly instructed below.

====================
MULTIPLE CHOICE RULE
====================

If the current predefined survey question has type "multiple",
IMMEDIATELY after the question text output a JSON block exactly like this:

{
  "questionType": "multiple",
  "options": ["Option 1", "Option 2", "Option 3"]
}

This JSON must appear directly after the question text with no explanation.

====================
QUESTION FORMAT
====================

Predefined survey questions MUST start with:

Question X of Y:

Follow-up questions MUST NOT use the "Question X of Y" format.

====================
SURVEY COMPLETION (VERY IMPORTANT)
====================

ONLY when ALL predefined survey questions AND their follow-ups are complete,
output this token on its OWN LINE:

[[SURVEY_COMPLETE]]

After that token, you may add ONE polite thank-you sentence.
DO NOT output this token under ANY other circumstance.

====================
PROGRESS METADATA (MANDATORY)
====================

At the VERY TOP of every response, include EXACTLY ONE line:

[PROGRESS question=X total=Y]

This line MUST appear first.
If it is missing, the response is INVALID.

====================
CONTEXT
====================

You are conducting this survey for the town specified in the survey metadata.
Mention the town naturally in your greeting.

Survey definition:
${JSON.stringify(survey, null, 2)}

Conversation so far:
${messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}
`.trim();

    // --- Call OpenAI Responses API ---
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      temperature: 0.3,
      max_output_tokens: 350
    });

    // --- Extract output text safely ---
    const rawReply =
      response.output_text ||
      response.output?.[0]?.content
        ?.filter(c => c.type === "output_text")
        ?.map(c => c.text)
        ?.join("") ||
      "";

    if (!rawReply) {
      throw new Error("Empty AI response");
    }

    // --- Parse PROGRESS metadata ---
    const progressMatch = rawReply.match(/\[PROGRESS question=(\d+) total=(\d+)\]/);
    if (!progressMatch) {
      throw new Error("Progress metadata missing from AI response");
    }

    const progress = {
      current: Number(progressMatch[1]),
      total: Number(progressMatch[2])
    };

    // --- Remove progress line ---
    let cleanReply = rawReply.replace(
      /\[PROGRESS question=\d+ total=\d+\]\n?/,
      ""
    );

    // --- Detect survey completion (HARD TOKEN ONLY) ---
    const surveyComplete = cleanReply.includes("[[SURVEY_COMPLETE]]");

    // --- Remove completion token from display text ---
    cleanReply = cleanReply.replace("[[SURVEY_COMPLETE]]", "").trim();

    // --- Extract multiple-choice JSON if present ---
    let aiData = null;
    const jsonMatch = cleanReply.match(/\{[\s\S]*?\}/);

    if (jsonMatch) {
      try {
        aiData = JSON.parse(jsonMatch[0]);
      } catch {
        console.warn("Failed to parse AI options JSON");
      }
    }

    // --- Remove JSON block from visible text ---
    const visibleReply = cleanReply.replace(/\{[\s\S]*?\}/, "").trim();

    // --- Save to DB ONLY when survey is complete ---
    if (surveyComplete) {
      await db.collection("SurveyResponse").insertOne({
        surveyName: survey.title || "unknown",
        messages: messages.concat({
          role: "assistant",
          content: visibleReply
        }),
        progress,
        createdAt: new Date()
      });

      console.log("Survey response saved");
    }

    // --- Send response to frontend ---
    res.json({
      reply: visibleReply,
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
