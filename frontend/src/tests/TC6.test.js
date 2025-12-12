// TC-6: Staff account invite and login
const { inviteStaff, staffLogin } = require('../communityPulse');

describe('TC-6 Staff account invite and login', () => {
  test('Admin can onboard staff members', () => {
    const staff = inviteStaff({ email: 'staff@example.com' });
    expect(staff).toHaveProperty('email', 'staff@example.com');
  });

  test('Staff can login successfully', () => {
    const login = staffLogin({ email: 'staff@example.com', password: 'password123' });
    expect(login).toBe(true);
  });
});
