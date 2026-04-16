/**
 * System Test: Community Pulse Backend
 * Description: This test suite verifies the core functionalities of the Community Pulse backend API, including feedback submission, data retrieval, and analytics endpoints.
 * It uses Supertest to simulate HTTP requests and checks the responses against expected outcomes.
*/

const request = require('supertest');
const app = require('../src/app'); //include our Express app
const db = require('../src/db'); //go to our database backend

describe('Community Pulse System Tests', () => {

  beforeAll(async () => {
    await db.migrate.latest();
    await db.seed.run();
  });

  afterAll(async () => {
    await db.destroy();
  });

  test('POST /api/feedback should accept new community feedback', async () => {
    const newFeedback = {
      text: "We need more green spaces.",
      neighborhood: "East Side",
      sentiment: "positive"
    };

    const res = await request(app)
      .post('/api/feedback')
      .send(newFeedback)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.text).toBe(newFeedback.text);
  });

  test('GET /api/feedback should return aggregated results', async () => {
    const res = await request(app)
      .get('/api/feedback')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    const sample = res.body[0];
    expect(sample).toHaveProperty('text');
    expect(sample).toHaveProperty('sentiment');
  });

  test('GET /api/analytics/trends should return trend data', async () => {
    const res = await request(app)
      .get('/api/analytics/trends')
      .expect(200);

    expect(res.body).toHaveProperty('sentimentBreakdown');
    expect(res.body).toHaveProperty('topKeywords');
  });

});
