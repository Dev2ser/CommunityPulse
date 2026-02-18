//unit test for extracting responses, getting top words, and getting sentiment
import {
  extractResponses,
  getTopWords,
  getSentiment
} from "../analytics.js";

describe("Analytics Utilities", () => {
  test("extractResponses returns flat list of answers + follow-ups", () => {
    const survey = {
      responses: [
        { answer: "Great place", followUps: [{ followUpAnswers: ["More parks"] }] },
        { answer: "Too noisy", followUps: [] }
      ]
    };

    const result = extractResponses(survey);
    expect(result).toEqual(["Great place", "More parks", "Too noisy"]);
  });

  test("extractResponses returns empty array for missing survey", () => {
    expect(extractResponses(null)).toEqual([]);
  });

  test("getTopWords returns sorted word frequency", () => {
    const responses = ["Love the park", "Park is clean", "Love the events"];

    const top = getTopWords(responses, 3);

    expect(top[0].word).toBe("love");
    expect(top[0].count).toBe(2);
    expect(top.some(w => w.word === "park")).toBe(true);
  });

  test("getTopWords ignores stopwords and short words", () => {
    const responses = ["The the the small small nice"];

    const top = getTopWords(responses);
    expect(top.length).toBe(0);
  });

  test("getSentiment returns positive label", () => {
    const result = getSentiment(["I love this place"]);
    expect(result.label).toBe("Positive");
  });

  test("getSentiment returns negative label", () => {
    const result = getSentiment(["This is terrible"]);
    expect(result.label).toBe("Negative");
  });

  test("getSentiment returns 'No data' for empty responses", () => {
    expect(getSentiment([])).toBe("No data");
  });
});
