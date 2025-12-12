// IT-2: Staff publishes a survey and residents access it
const { createSurvey, loadSurvey, submitSurveyResponse } = require('../communityPulse');

describe('IT-2 Staff publishes survey and residents access it', () => {
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
});
