describe('TC-3 Staff survey management', () => {

  // Positive
  test('New survey is created successfully', () => {
    const survey = createSurvey({ title: 'Staff Survey', questions: ['Q1'] });
    expect(survey).toHaveProperty('id');
    expect(survey.title).toBe('Staff Survey');
  });

  test('Question edits are reflected', () => {
    const updated = editSurveyQuestion('surveyId', 0, 'Updated Question');
    expect(updated.questions[0]).toBe('Updated Question');
  });


  // Negative cases
  test('Editing a non-existent survey throws error', () => {
    expect(() => editSurveyQuestion('fakeId', 0, 'Q')).toThrow();
  });

  test('Editing with out-of-range question index throws error', () => {
    expect(() => editSurveyQuestion('surveyId', 99, 'Q')).toThrow();
  });

  test('Creating survey with missing title fails', () => {
    expect(() => createSurvey({ questions: ['Q1'] })).toThrow();
  });

  test('Editing question with invalid type fails', () => {
    expect(() => editSurveyQuestion('surveyId', 0, 123)).toThrow();
  });

  test('Missing parameters cause failure', () => {
    expect(() => editSurveyQuestion()).toThrow();
  });

});
