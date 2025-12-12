// IT-3: Report generation and approval
const { generateReport, approveReport, exportReport } = require('../communityPulse');

describe('IT-3 Report generation and approval', () => {
  // Positive Tests
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

  // Negative Tests
  test('Generating a report for nonexistent survey should fail', () => {
    expect(() => generateReport('invalidSurveyId')).toThrow();
  });

  test('Approving nonexistent report should fail', () => {
    expect(() => approveReport('badReportId')).toThrow();
  });

  test('Approving already approved report should fail', () => {
    const alreadyApproved = approveReport('reportId');
    expect(alreadyApproved.status).toBe('approved');

    // second approval should throw
    expect(() => approveReport('reportId')).toThrow();
  });

  test('Exporting a report in unsupported format should fail', () => {
    expect(() => exportReport('reportId', 'xls')).toThrow();
  });

  test('Exporting nonexistent report should fail', () => {
    expect(() => exportReport('invalidReportId', 'pdf')).toThrow();
  });

  test('Exporting a report with missing format should fail', () => {
    expect(() => exportReport('reportId')).toThrow();
  });
});
