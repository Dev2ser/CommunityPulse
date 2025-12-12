// TC-6: Staff account invite and login
const { inviteStaff, staffLogin } = require('../communityPulse');

describe('TC-6 Staff account invite and login', () => {
  // Positive Tests
  test('Admin can onboard staff members', () => {
    const staff = inviteStaff({ email: 'staff@example.com' });
    expect(staff).toHaveProperty('email', 'staff@example.com');
  });

  test('Staff can login successfully', () => {
    const login = staffLogin({ email: 'staff@example.com', password: 'password123' });
    expect(login).toBe(true);
  });

  // Negative Tests
  test('Inviting staff without email should fail', () => {
    expect(() => inviteStaff({})).toThrow();
  });

  test('Inviting staff with invalid email format should fail', () => {
    expect(() => inviteStaff({ email: 'not-an-email' })).toThrow();
  });

  test('Staff login fails with incorrect password', () => {
    expect(() =>
      staffLogin({ email: 'staff@example.com', password: 'wrongpassword' })
    ).toThrow();
  });

  test('Staff login fails if account does not exist', () => {
    expect(() =>
      staffLogin({ email: 'unknown@example.com', password: 'password123' })
    ).toThrow();
  });

  test('Staff login fails when required fields are missing', () => {
    expect(() => staffLogin({})).toThrow();
  });
});
