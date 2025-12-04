import React from "react";
import "./Dashboard.css";

const weeklyData = [
  { day: "Mon", responses: 24 },
  { day: "Tue", responses: 38 },
  { day: "Wed", responses: 45 },
  { day: "Thu", responses: 52 },
  { day: "Fri", responses: 41 },
  { day: "Sat", responses: 18 },
  { day: "Sun", responses: 15 },
];

const recentActivity = [
  { id: 1, action: "New survey response", survey: "Q1 2025 Community Feedback", time: "5 minutes ago", status: "completed" },
  { id: 2, action: "Survey published", survey: "Amenities Satisfaction Survey", time: "2 hours ago", status: "published" },
  { id: 3, action: "New survey response", survey: "Resident Safety Survey", time: "6 hours ago", status: "completed" },
  { id: 4, action: "Export completed", survey: "Q4 2024 Results", time: "1 day ago", status: "export" },
];

const stats = [
  { title: "Total Surveys", value: "24", trend: "+3 this month" },
  { title: "Active Surveys", value: "8", trend: "Currently live" },
  { title: "Total Responses", value: "1,847", trend: "+12% vs last month" },
  
];

const quickStats = [
  { label: "Completion Rate", value: "84%", tone: "green" },
  { label: "Avg. Response Time", value: "3.2 min", tone: "blue" },
  { label: "Active Communities", value: "12", tone: "navy" },
  { label: "Sentiment Score", value: "7.8/10", tone: "green" },
];

export default function Dashboard() {
  return (
    <div className="dashboard-content">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2 className="dashboard-title">Overview</h2>
          <p className="dashboard-subtitle">Track your community feedback performance</p>
        </div>

        <div className="stats-grid">
          {stats.map((item) => (
            <div key={item.title} className="stat-card">
              <div className="stat-label">{item.title}</div>
              <div className="stat-value">{item.value}</div>
              <div className="stat-trend">{item.trend}</div>
            </div>
          ))}
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <h3 className="chart-title">Weekly Response Activity</h3>
            <div className="mini-bars">
              {weeklyData.map((day) => (
                <div key={day.day} className="mini-bar">
                  <div
                    className="mini-bar-fill"
                    style={{ height: `${day.responses * 3}px` }}
                    title={`${day.day}: ${day.responses}`}
                  />
                  <span className="mini-bar-label">{day.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="quick-stats-card">
            <h3 className="quick-stats-title">Quick Stats</h3>
            <div className="quick-stats-list">
              {quickStats.map((stat, idx) => (
                <div
                  key={stat.label}
                  className={idx === quickStats.length - 1 ? "quick-stat-item-last" : "quick-stat-item"}
                >
                  <span className="quick-stat-label">{stat.label}</span>
                  <span className={`quick-stat-value-${stat.tone}`}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="activity-card">
          <h3 className="activity-title">Recent Activity</h3>
          <div className="activity-list">
            {recentActivity.map((item) => (
              <div key={item.id} className="activity-item">
                <div
                  className={`activity-icon ${
                    item.status === "completed"
                      ? "activity-icon-completed"
                      : item.status === "published"
                      ? "activity-icon-published"
                      : item.status === "insight"
                      ? "activity-icon-insight"
                      : "activity-icon-default"
                  }`}
                >
                  <span className="activity-icon-dot" />
                </div>
                <div className="activity-content">
                  <p className="activity-action">{item.action}</p>
                  <p className="activity-survey">{item.survey}</p>
                </div>
                <div className="activity-time">{item.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
