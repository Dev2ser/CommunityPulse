// TC-1: Community resident survey engagement
const { loadSurvey, submitSurveyResponse } = require('../communityPulse');

describe('TC-1 Community resident survey engagement', () => {
  // Positive Tests
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

  // Negative Tests
  test('Loading a nonexistent survey should fail', () => {
    expect(() => loadSurvey('invalidSurveyId')).toThrow();
  });

  test('Submitting a response to a nonexistent survey should fail', () => {
    expect(() =>
      submitSurveyResponse('invalidSurveyId', { answer: 'Test Answer' })
    ).toThrow();
  });

  test('Submitting a response without an answer should fail', () => {
    expect(() => submitSurveyResponse('openSurveyId', {})).toThrow();
  });

  test('Submitting a response with invalid answer type should fail', () => {
    expect(() =>
      submitSurveyResponse('openSurveyId', { answer: 1234 })
    ).toThrow();
  });

  test('Submitting a response with missing payload should fail', () => {
    expect(() => submitSurveyResponse('openSurveyId')).toThrow();
  });
});
