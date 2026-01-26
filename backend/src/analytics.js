import { removeStopwords } from "stopword";
import Sentiment from "sentiment";
import OpenAI from "openai";

const sentiment = new Sentiment();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const IGNORE_WORDS = [
  "better",
  "see",
  "small",
  "nicer",
  "not",
  "would",
  "could",
  "please"
];

//Extract all text answers from ONE survey document
export function extractResponses(survey) {
  if (!survey || !survey.responses) return [];

  return survey.responses.flatMap(r => [
    r.answer,
    ...(r.followUps
      ? r.followUps.flatMap(f => f.followUpAnswers || [])
      : [])
  ]);
}

//Top N keywords using stopword removal 
export function getTopWords(responses, limit = 20) {
  const freq = {};

  responses.forEach(text => {
    if (!text) return;

    const tokens = text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/);

    const clean = removeStopwords(tokens);

    clean.forEach(word => {
      if (word.length > 2 && !IGNORE_WORDS.includes(word)) {
        freq[word] = (freq[word] || 0) + 1;
      }
    });
  });

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}

export function getSentiment(responses) {
  const validResponses = responses.filter(r => typeof r === "string" && r.trim());
  if (!validResponses.length) return "No data";

  // Sum all sentiment scores
  const scores = validResponses.map(r => sentiment.analyze(r).score);
  const sum = scores.reduce((acc, s) => acc + s, 0); 
  const avg = (sum / scores.length) * 10; 

  let label = "Neutral";
  if (avg> 0) label = "Positive";
  else if (avg < 0) label = "Negative";

  return {
    score: avg.toFixed(2),
    label,
  };
}


//Generate AI suggestions based on top words 
export async function getSuggestions(topWords) {
  if (!topWords || !topWords.length) return [];

  const prompt = `
You are an assistant analyzing survey feedback. 
The top words from survey responses are: ${topWords.map(w => w.word).join(", ")}.
Provide 3 actionable, concise suggestions for types of housing project reccomendation based on these top words.
Respond in a bullet-point list.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const text = completion.choices[0].message.content;

    // Split by line breaks and remove empty lines
    return text
      .split("\n")
      .map(l => l.replace(/^[-•\d\.\s]+/, "").trim())
      .filter(Boolean);
  } catch (err) {
    console.error("AI suggestions error:", err);
    return [];
  }
}

export async function getCategories(topWords) {
  if (!topWords?.length) return [];

  const prompt = `
Return ONLY valid JSON. No explanation, no markdown, no text.

The top words are: ${topWords.map(w => w.word).join(", ")}.

Group into categories and return exactly this format:
[
  { "name": "CategoryName", "mentions": 0, "words": ["word1"], "icon": "🏠" }
]
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0
    });

    const text = completion.choices[0].message.content;

    // Parse JSON safely
    const categories = JSON.parse(text);
    return categories;
  } catch (err) {
    console.error("AI categories error:", err);
    return [];
  }
}

