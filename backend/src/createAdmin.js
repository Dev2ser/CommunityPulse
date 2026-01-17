import express from "express";
import OpenAI from "openai";
// import SurveyResponse from "../models/SurveyResponse.js"; // <-- enable when ready

const router = express.Router();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/survey-chat", async (req, res) => {
  try {
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
7. When all survey questions are completed, thank the user and END the survey.

SAFETY:
If the user provides offensive, abusive, or explicit content:
- Immediately respond:
  “I’m sorry, but I can’t continue the survey due to inappropriate content.”
- END the survey and ask NO MORE QUESTIONS

STYLE:
Be warm, supportive, short, and conversational.
Stop after each message you send and wait for the user reply.

CONTROL:
When responding, ALWAYS return valid JSON in this exact format:

{
  "reply": string,
  "survey_complete": boolean
}

- survey_complete MUST be true ONLY when all survey questions are finished
- Do NOT include any text outside the JSON
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
      temperature: 0.6,
      max_tokens: 300
    });

    let parsed;
    try {
      parsed = JSON.parse(completion.choices[0].message.content);
    } catch (err) {
      console.error("Invalid AI JSON:", completion.choices[0].message.content);
      return res.status(500).json({ message: "Invalid AI response format" });
    }

    const { reply, survey_complete } = parsed;

    const updatedTranscript = [
      ...messages,
      { role: "assistant", content: reply }
    ];

    // ✅ Persist ONLY when completed
    /*
    if (survey_complete) {
      await SurveyResponse.create({
        surveyId: survey.id,
        transcript: updatedTranscript,
        completedAt: new Date()
      });
    }
    */

    res.json({
      reply,
      survey_complete,
      transcript: updatedTranscript
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "AI chat error" });
  }
});

export default router;
