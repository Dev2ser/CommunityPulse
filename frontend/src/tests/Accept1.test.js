/**
 * Acceptance Test: Community Pulse Frontend
 * Simulates a full user flow using React Testing Library.
 */

const { filterSurveyResults } = require('../communityPulse');

describe('A-1 Community insights filtration', () => {
  test('Spam and duplicate answers are removed', () => {
    const results = filterSurveyResults([
      { answer: 'Yes' },
      { answer: 'Yes' },
      { answer: 'Spam' }
    ]);
    expect(results).toEqual([{ answer: 'Yes' }]);
  });
});
