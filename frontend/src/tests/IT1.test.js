// IT-1: Start to finish AI-assisted survey completion
const { AIChatService, submitSurveyResponse } = require('../communityPulse');

describe('IT-1 AI-assisted survey completion', () => {
  // Positive tests
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

  // Negative tests
  test('AIChatService fails to start on invalid survey ID', () => {
    expect(() => AIChatService.startSurvey('badSurveyId')).toThrow();
  });

  test('Survey response fails when media fields have invalid types', () => {
    expect(() =>
      submitSurveyResponse('surveyId', {
        text: 'Answer',
        imageUrl: 12345,            // invalid type
        voiceTranscript: false      // invalid type
      })
    ).toThrow();
  });

  test('Survey response fails when required text field is missing', () => {
    expect(() =>
      submitSurveyResponse('surveyId', {
        imageUrl: 'http://example.com/img.png'
      })
    ).toThrow();
  });

  test('Survey response fails for nonexistent survey', () => {
    expect(() =>
      submitSurveyResponse('invalidSurveyId', {
        text: 'Answer',
        imageUrl: 'http://example.com/img.png'
      })
    ).toThrow();
  });

  test('Survey response fails when no payload is provided', () => {
    expect(() => submitSurveyResponse('surveyId')).toThrow();
  });
});
