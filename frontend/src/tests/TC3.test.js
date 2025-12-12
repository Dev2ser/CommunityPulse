// TC-3: Staff survey management
const { createSurvey, editSurveyQuestion } = require('../communityPulse');

describe('TC-3 Staff survey management', () => {
  test('New survey is created successfully', () => {
    const survey = createSurvey({ title: 'Staff Survey', questions: ['Q1'] });
    expect(survey).toHaveProperty('id');
    expect(survey.title).toBe('Staff Survey');
  });

  test('Question edits are reflected', () => {
    const updatedSurvey = editSurveyQuestion('surveyId', 0, 'Updated Question');
    expect(updatedSurvey.questions[0]).toBe('Updated Question');
  });
});
