const request = require('supertest');
const app = require('../src/frontend/app');

describe('Basic Sanity Test', () => {
  test('the test runner is working', () => {
    expect(1 + 1).toBe(2);
  });

  test('GET / should respond with 200 OK (or at least not crash)', async () => {
    const res = await request(app)
      .get('/')
      .expect(200);

    expect(res.status).toBe(200);
  });
});
