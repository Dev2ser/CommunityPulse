// IT-1: Start to finish AI-assisted survey completion
const { AIChatService, submitSurveyResponse } = require('../communityPulse');

describe('IT-1 AI-assisted survey completion', () => {
  test('AIChatService guides question flow', () => {
    const flow = AIChatService.startSurvey('surveyId');
    expect(flow).toBeDefined();
  });

  test('Media inputs are accepted and stored', () => {
    const response = submitSurveyResponse('surveyId', {
      text: 'Answer',
      imageUrl: 'http://example.com/img.png',
      voiceTranscript: 'Transcript'
    });
    expect(response).toHaveProperty('imageUrl');
    expect(response).toHaveProperty('voiceTranscript');
  });
});
