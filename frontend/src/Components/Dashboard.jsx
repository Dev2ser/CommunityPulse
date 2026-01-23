import React, { useEffect, useMemo, useState } from "react";
import "../Styles/Dashboard.css";

const weekdayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Dashboard() {
  const API_BASE = import.meta?.env?.VITE_API_URL || "http://localhost:5001/api";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    totalSurveys: 0,
    publishedSurveys: 0,
    draftSurveys: 0,
    totalQuestions: 0,
    weekly: [],
    recentActivity: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/dashboard`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to load dashboard data");
        }
        const json = await res.json();
        setData({
          totalSurveys: json.totalSurveys || 0,
          publishedSurveys: json.publishedSurveys || 0,
          draftSurveys: json.draftSurveys || 0,
          totalQuestions: json.totalQuestions || 0,
          weekly: json.weekly || [],
          recentActivity: json.recentActivity || [],
        });
      } catch (err) {
        setError(err.message || "Unable to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE]);

  const weeklyBars = useMemo(() => {
    const map = new Map();
    (data.weekly || []).forEach((w) => map.set(w.day, w.count));
    return weekdayOrder.map((day) => ({
      day,
      count: map.get(day) || 0,
    }));
  }, [data.weekly]);

  const stats = [
    { label: "Total Surveys", value: data.totalSurveys || 0, trend: "" },
    { label: "Active Surveys", value: data.publishedSurveys || 0, trend: "" },
    { label: "Total Responses", value: 0, trend: "" },
  ];

  const quickStats = [
    { label: "Completion Rate", value: "0%", tone: "green" },
    { label: "Avg. Response Time", value: "0 min", tone: "blue" },
    { label: "Active Communities", value: "0", tone: "navy" },
    { label: "Sentiment Score", value: "0/10", tone: "green" },
  ];

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString();
  };

  return (
    <div className="dashboard-content">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2 className="dashboard-title">Overview</h2>
          <p className="dashboard-subtitle">Track your community feedback performance</p>
        </div>

        {error && <div className="error-banner">{error}</div>}
        {loading && <div className="info-banner">Loading dashboard...</div>}

        <div className="stats-grid">
          {stats.map((item) => (
            <div key={item.title} className="stat-card">
              <div className="stat-label">{item.label}</div>
              <div className="stat-value">{item.value}</div>
              {item.trend && <div className="stat-trend">{item.trend}</div>}
            </div>
          ))}
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <h3 className="chart-title">Weekly Survey Creation</h3>
            <div className="mini-bars">
              {weeklyBars.map((day) => (
                <div key={day.day} className="mini-bar">
                  <div
                    className="mini-bar-fill"
                    style={{ height: `${Math.min(day.count * 12, 140)}px` }}
                    title={`${day.day}: ${day.count}`}
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
          <h3 className="activity-title">Recent Surveys</h3>
          <div className="activity-list">
            {(data.recentActivity || []).map((item) => (
              <div key={item.id} className="activity-item">
                <div
                  className={`activity-icon ${
                    item.status === "published"
                      ? "activity-icon-published"
                      : item.status === "draft"
                      ? "activity-icon-default"
                      : "activity-icon-default"
                  }`}
                >
                  <span className="activity-icon-dot" />
                </div>
                <div className="activity-content">
                  <p className="activity-action">{item.surveyTitle || "Untitled survey"}</p>
                  <p className="activity-survey">Status: {item.status || "draft"}</p>
                </div>
                <div className="activity-time">{formatDate(item.createdAt)}</div>
              </div>
            ))}
            {!loading && (!data.recentActivity || data.recentActivity.length === 0) && (
              <div className="activity-item">
                <div className="activity-content">
                  <p className="activity-action">No surveys yet</p>
                  <p className="activity-survey">Create your first survey to see activity.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
