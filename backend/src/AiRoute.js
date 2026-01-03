import express from "express";
import OpenAI from "openai";

const router = express.Router();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/ai/survey-chat
router.post("/survey-chat", async (req, res) => {
  try {
    const { survey, messages } = req.body;

    // Build AI messages
    const aiMessages = [
        {
          role: "system",
          content: `
      You are a friendly community survey assistant.
      Ask **one survey question at a time** from the survey.
      You may ask **up to 3 follow-up questions** per survey question if needed.
      **Even if the user says "no" or "nothing else", continue to the next survey question.**
      Do NOT skip survey questions.
      Stop and wait after each question or follow-up is answered.
      Do not answer for the user.
      If the question is multiple choice, present the choices.
      Keep the conversation natural and friendly.
          `,
        },
        ...(messages.length === 0
          ? [
              {
                role: "user",
                content: `Here is the survey JSON:\n${JSON.stringify(survey)}`,
              },
            ]
          : []),
        ...messages,
      ];

    const completion = await client.chat.completions.create({
      model: "gpt-4",
      messages: aiMessages,
      temperature: 0.6,
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "AI chat error" });
  }
});

export default router;
