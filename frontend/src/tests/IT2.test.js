// IT-2: Staff publishes a survey and residents access it
const { createSurvey, loadSurvey, submitSurveyResponse } = require('../communityPulse');

describe('IT-2 Staff publishes survey and residents access it', () => {
  // Positive Tests
  test('Survey is created and stored', () => {
    const survey = createSurvey({ title: 'Resident Survey', questions: ['Q1'] });
    expect(survey).toHaveProperty('id');
  });

  test('Resident can see and take survey', () => {
    const survey = loadSurvey('surveyId');
    expect(survey).toBeDefined();

    const response = submitSurveyResponse('surveyId', { answer: 'Resident answer' });
    expect(response).toHaveProperty('surveyId', 'surveyId');
  });

  // Negative Tests
  test('Creating a survey without title should fail', () => {
    expect(() =>
      createSurvey({ questions: ['Q1'] })
    ).toThrow();
  });

  test('Creating a survey without questions should fail', () => {
    expect(() =>
      createSurvey({ title: 'Resident Survey' })
    ).toThrow();
  });

  test('Resident cannot load a nonexistent survey', () => {
    expect(() =>
      loadSurvey('invalidSurveyId')
    ).toThrow();
  });

  test('Resident cannot submit response with missing answer', () => {
    expect(() =>
      submitSurveyResponse('surveyId', {})
    ).toThrow();
  });

  test('Resident cannot submit to a nonexistent survey', () => {
    expect(() =>
      submitSurveyResponse('invalidSurveyId', { answer: 'Test' })
    ).toThrow();
  });

})