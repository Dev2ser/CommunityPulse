// TC-1: Community resident survey engagement
const { loadSurvey, submitSurveyResponse } = require('../communityPulse');

describe('TC-1 Community resident survey engagement', () => {
  test('Survey loads with all questions displayed', () => {
    const survey = loadSurvey('openSurveyId');
    expect(survey).toBeDefined();
    expect(Array.isArray(survey.questions)).toBe(true);
    expect(survey.questions.length).toBeGreaterThan(0);
  });

  test('SurveyResponse object is created and submitted', () => {
    const response = submitSurveyResponse('openSurveyId', { answer: 'Sample text answer' });
    expect(response).toBeDefined();
    expect(response).toHaveProperty('id');
    expect(response).toHaveProperty('surveyId', 'openSurveyId');
    expect(response).toHaveProperty('answer', 'Sample text answer');
  });
});
