// TC-4: Admin report accessibility
const { approveReport, exportReport } = require('../communityPulse');

describe('TC-4 Admin report accessibility', () => {
  test('Report status becomes approved', () => {
    const report = approveReport('reportId');
    expect(report.status).toBe('approved');
  });

  test('Admin can export report to PDF', () => {
    const pdf = exportReport('reportId', 'pdf');
    expect(pdf).toContain('%PDF');
  });
});
