// TC-7: Sentiment extraction and analysis for open-ended responses
const { submitMediaAnswer, AIChatService } = require('../communityPulse');

describe('TC-7 AI-powered survey features', () => {
  test('Images and voice transcripts are accepted', () => {
    const answer = submitMediaAnswer('surveyId', {
      imageUrl: 'http://example.com/image.png',
      voiceTranscript: 'Sample transcript'
    });
    expect(answer).toHaveProperty('imageUrl');
    expect(answer).toHaveProperty('voiceTranscript');
  });

  test('AIChatService selects follow-up questions dynamically', () => {
    const followUp = AIChatService.getNextQuestion('surveyId', 'Sample transcript');
    expect(followUp).toBeDefined();
    expect(typeof followUp).toBe('string');
  });
});
