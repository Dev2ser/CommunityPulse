import express from "express";
import { getDb } from "./db.js"; // your MongoDB connection
import OpenAI from "openai";

const router = express.Router();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/survey-chat", async (req, res) => {
  try {
    const db = getDb();
    const { survey, messages } = req.body;

    const aiMessages = [
      {
        role: "system",
        content: `
You are a friendly community survey assistant interviewing the user.

RULES:
1. Ask EXACTLY ONE survey question at a time, in the order they appear.
2. For each survey question, you may ask up to THREE friendly follow-up questions.
3. After the third follow-up (or sooner if appropriate), MOVE ON to the next survey question.
4. Even if the user says “no”, “skip”, or “nothing else”, STILL move to the next survey question.
5. NEVER answer for the user.
6. NEVER repeat questions already answered.
7. On predefined survey questions, always start with:
   "Question X of Y:" where X is the current question number and Y is total questions.
8. When all survey questions are completed, thank the user and END the survey Send the.

INTERNAL METADATA (VERY IMPORTANT):
At the VERY TOP of your response, include exactly one line in this format:
[PROGRESS question=X total=Y]

This line is for internal use only. Do not explain it to the user.

SAFETY:
If the user provides offensive, abusive, or explicit content:
- Immediately respond:
  “I’m sorry, but I can’t continue the survey due to inappropriate content.”
- END the survey and ask NO MORE QUESTIONS.

STYLE:
Be warm, supportive, short, and conversational.
Stop after each message you send and wait for the user reply.
        `
      },
      {
        role: "user",
        content: `Survey definition:\n${JSON.stringify(survey)}`
      },
      ...messages
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4",
      messages: aiMessages,
      temperature: 0.3,
      max_tokens: 300
    });

    const rawReply = completion.choices[0].message.content;

    // --- Parse progress metadata ---
    const progressMatch = rawReply.match(
      /\[PROGRESS question=(\d+) total=(\d+)\]/
    );

    const progress = progressMatch
      ? {
          current: Number(progressMatch[1]),
          total: Number(progressMatch[2])
        }
      : null;

    // --- Remove metadata line before sending to UI ---
    const cleanReply = rawReply.replace(
      /\[PROGRESS question=\d+ total=\d+\]\n?/,
      ""
    );

    if (progress) {
      console.log(
        `Survey progress: Question ${progress.current} of ${progress.total}`
      );
    } else {
      console.warn("Survey progress metadata missing");
    }

    // --- Detect if survey ended ---
    const surveyComplete = progress && progress.current >= progress.total;

    // --- Save final response to DB only if survey complete ---
    if (surveyComplete) {
      const entry = {
        messages: messages.concat({ role: "assistant", content: cleanReply }),
        progress,
        createdAt: new Date(),
        surveyId: survey.id || "unknown"
      };

      const result = await db.collection("SurveyResponse").insertOne(entry);
      console.log("Survey saved to DB with id:", result.insertedId);
    }

    res.json({
      reply: cleanReply,
      progress,
      surveyComplete
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "AI chat error" });
  }
});

export default router;
