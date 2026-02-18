//Integration test for dashboard routes, making sure dashboard computes stats correctly
import request from "supertest";
import express from "express";
import dashboardRouter from "../dashboard.js";
import { getDb } from "../db.js";

jest.mock("../db.js");

const app = express();
app.use("/", dashboardRouter);

describe("GET /dashboard", () => {
  test("returns dashboard summary with correct fields", async () => {
    const mockSurveys = [
      {
        _id: "1",
        surveyTitle: "Survey A",
        status: "published",
        questions: ["Q1", "Q2"],
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02")
      },
      {
        _id: "2",
        surveyTitle: "Survey B",
        status: "draft",
        questions: ["Q1"],
        createdAt: new Date("2024-01-03"),
        updatedAt: new Date("2024-01-04")
      }
    ];

    getDb.mockReturnValue({
      collection: () => ({
        find: () => ({
          sort: () => ({
            toArray: () => Promise.resolve(mockSurveys)
          })
        })
      })
    });

    const res = await request(app).get("/dashboard");

    expect(res.status).toBe(200);
    expect(res.body.totalSurveys).toBe(2);
    expect(res.body.publishedSurveys).toBe(1);
    expect(res.body.draftSurveys).toBe(1);
    expect(res.body.totalQuestions).toBe(3);
    expect(Array.isArray(res.body.weekly)).toBe(true);
    expect(res.body.recentActivity.length).toBe(2);
  });

  test("returns 500 when DB is not initialized", async () => {
    getDb.mockReturnValue(null);

    const res = await request(app).get("/dashboard");
    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Database not initialized");
  });
});
