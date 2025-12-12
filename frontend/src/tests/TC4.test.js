describe('TC-4 Admin report accessibility', () => {

  test('Report status becomes approved', () => {
    const report = approveReport('reportId');
    expect(report.status).toBe('approved');
  });

  test('Admin can export report to PDF', () => {
    const pdf = exportReport('reportId', 'pdf');
    expect(pdf).toContain('%PDF');
  });

  // Negative tests
  test('Approving nonexistent report throws error', () => {
    expect(() => approveReport('badId')).toThrow();
  });

  test('Exporting nonexistent report throws error', () => {
    expect(() => exportReport('badId', 'pdf')).toThrow();
  });

  test('Exporting with unsupported format throws error', () => {
    expect(() => exportReport('reportId', 'unsupported')).toThrow();
  });

  test('Non-admin cannot export report', () => {
    expect(() =>
      exportReport('reportId', 'pdf', { role: 'staff' })
    ).toThrow();
  });
});
