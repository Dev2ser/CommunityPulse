// TC-6: Staff account invite and login
// TC-5: Community insights filtration and viewing
const { filterSurveyResults } = require('../communityPulse');

describe('TC-5 Community insights filtration', () => {
  test('Spam and duplicate answers are removed', () => {
    const results = filterSurveyResults([
      { answer: 'Yes' },
      { answer: 'Yes' },
      { answer: 'Spam' }
    ]);
    expect(results).toEqual([{ answer: 'Yes' }]);
  });
});
