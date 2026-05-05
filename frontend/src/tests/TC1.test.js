// TC-1: Community resident survey engagement
// communityPulse.js

const surveys = {
  openSurveyId: {
    id: 'openSurveyId',
    questions: ['Q1', 'Q2', 'Q3']
  }
};

function loadSurvey(surveyId) {
  const survey = surveys[surveyId];
  if (!survey) {
    throw new Error('Survey not found');
  }
  return survey;
}

function submitSurveyResponse(surveyId, payload) {
  const survey = surveys[surveyId];
  if (!survey) {
    throw new Error('Survey not found');
  }

  if (!payload || typeof payload.answer === 'undefined') {
    throw new Error('Answer required');
  }

  if (typeof payload.answer !== 'string') {
    throw new Error('Invalid answer type');
  }

  return {
    id: 'response-' + Date.now(),
    surveyId,
    answer: payload.answer
  };
}

module.exports = { loadSurvey, submitSurveyResponse };
