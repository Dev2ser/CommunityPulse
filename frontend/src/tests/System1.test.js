/**
 * System Test: Community Pulse Frontend
 * Simulates answer filtration in the survey results using Jest.
 */

const { filterSurveyResults } = require('../communityPulse');

describe('S-1 Community insights filtration', () => {
  test('Spam and duplicate answers are removed', () => {
    const results = filterSurveyResults([
      { answer: 'Yes' },
      { answer: 'Yes' },
      { answer: 'Spam' }
    ]);
    expect(results).toEqual([{ answer: 'Yes' }]);
  });
});
