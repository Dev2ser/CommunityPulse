// IT-3: Report generation and approval
const { generateReport, approveReport, exportReport } = require('../communityPulse');

describe('IT-3 Report generation and approval', () => {
  test('Report is generated with sentiment analysis', () => {
    const report = generateReport('surveyId');
    expect(report).toHaveProperty('sentiment');
  });

  test('Admin approves and exports report', () => {
    const approved = approveReport('reportId');
    expect(approved.status).toBe('approved');
    const pdf = exportReport('reportId', 'pdf');
    expect(pdf).toContain('%PDF');
  });
});
