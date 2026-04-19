import React, { useEffect, useMemo, useState } from "react";
import "../Styles/Dashboard.css";
import { API_BASE } from "../utils/api";
import { FileText, MessageSquare, Clock3, CircleCheck } from "lucide-react";
import { TrendingUp } from "lucide-react";
import { TrendingDown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    totalSurveys: 0,
    publishedSurveys: 0,
    draftSurveys: 0,
    totalQuestions: 0,
    totalResponses: 0,
    responsesThisWeek: 0,
    avgResponseDelayMs: null,
    completionRate: null,
    completionRateDeltaFromLastMonth: null,
    weekly: [],
    recentActivity: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [dashboardRes, responseCountRes] = await Promise.all([
          fetch(`${API_BASE}/dashboard`),
          fetch(`${API_BASE}/survey/responseCountAll`),
        ]);

        if (!dashboardRes.ok) {
          const errData = await dashboardRes.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to load dashboard data");
        }

        const json = await dashboardRes.json();

        let totalResponsesFromCounts = null;
        if (responseCountRes.ok) {
          const countJson = await responseCountRes.json().catch(() => ({}));
          totalResponsesFromCounts = (countJson.surveys || []).reduce(
            (sum, survey) => sum + (survey.totalResponses || 0),
            0,
          );
        }

        setData({
          totalSurveys: json.totalSurveys || 0,
          publishedSurveys: json.publishedSurveys || 0,
          draftSurveys: json.draftSurveys || 0,
          totalQuestions: json.totalQuestions || 0,
          totalResponses:
            typeof totalResponsesFromCounts === "number"
              ? totalResponsesFromCounts
              : json.totalResponses || 0,
          responsesThisWeek: json.responsesThisWeek || 0,
          avgResponseDelayMs:
            typeof json.avgResponseDelayMs === "number"
              ? json.avgResponseDelayMs
              : null,
          completionRate:
            typeof json.completionRate === "number"
              ? json.completionRate
              : null,
          completionRateDeltaFromLastMonth:
            typeof json.completionRateDeltaFromLastMonth === "number"
              ? json.completionRateDeltaFromLastMonth
              : null,
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
  }, []);

  const formatAvgDelay = (ms) => {
    if (typeof ms !== "number" || Number.isNaN(ms)) return "N/A";

    const hourMs = 60 * 60 * 1000;
    const dayMs = 24 * hourMs;

    if (ms < hourMs) {
      const minutes = Math.max(1, Math.round(ms / (60 * 1000)));
      return `${minutes}m`;
    }

    if (ms < dayMs) {
      return `${(ms / hourMs).toFixed(1)}h`;
    }

    return `${(ms / dayMs).toFixed(1)}d`;
  };

  const formatPercent = (value) => {
    if (typeof value !== "number" || Number.isNaN(value)) return "N/A";
    return `${Math.round(value)}%`;
  };

  const formatDelta = (value) => {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return { text: "No last month baseline", muted: true };
    }

    const sign = value > 0 ? "+" : "";
    return {
      text: `${sign}${value.toFixed(1)}% from last month`,
      muted: false,
    };
  };

  const completionDelta = formatDelta(data.completionRateDeltaFromLastMonth);

  const topStats = [
    {
      icon: FileText,
      label: "Total Surveys",
      value: data.totalSurveys || 0,
      trend: `${data.publishedSurveys || 0} active`,
      trendDirection: "up",
    },
    {
      icon: MessageSquare,
      label: "Total Responses",
      value: data.totalResponses || 0,
      trend: `${data.responsesThisWeek > 0 ? "+" : ""}${data.responsesThisWeek || 0} this week`,
      trendDirection: data.responsesThisWeek < 0 ? "down" : "up",
    },
  ];

  const sideStats = [
    {
      icon: Clock3,
      label: "Avg Response Time",
      value: formatAvgDelay(data.avgResponseDelayMs),
      trend: "Average submit delay",
      mutedTrend: true,
    },
    {
      icon: CircleCheck,
      label: "Completion Rate",
      value: formatPercent(data.completionRate),
      trend: completionDelta.text,
      mutedTrend: completionDelta.muted,
      trendDirection:
        typeof data.completionRateDeltaFromLastMonth === "number" &&
        data.completionRateDeltaFromLastMonth < 0
          ? "down"
          : "up",
    },
  ];

  const weeklyChartData = useMemo(
    () => (data.weekly || []).map((item) => ({ day: item.day, count: item.count || 0 })),
    [data.weekly],
  );

  return (
    <div className="dashboard-content">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2 className="dashboard-title">Overview</h2>
          <p className="dashboard-subtitle">
            Real-time metrics across all community surveys
          </p>
        </div>

        {error && <div className="error-banner">{error}</div>}
        {loading && <div className="info-banner">Loading dashboard...</div>}

        <div className="top-stats-grid">
          {topStats.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.label} className="stat-card">
                <div className="stat-icon-wrap">
                  <Icon size={16} />
                </div>
                <div className="stat-label">{item.label}</div>
                <div className="stat-value">{item.value}</div>
                {item.trend && (
                  <div
                    className={
                      item.mutedTrend ? "stat-trend muted" : "stat-trend"
                    }
                  >
                    {!item.mutedTrend &&
                      (item.trendDirection === "down" ? (
                        <TrendingDown size={12} className="trend-arrow" />
                      ) : (
                        <TrendingUp size={12} className="trend-arrow" />
                      ))}
                    {item.trend}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="dashboard-bottom-grid">
          <div className="activity-panel">
            <h3 className="activity-panel-title">Weekly Activity</h3>
            <div className="activity-chart-card">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyChartData}
                  margin={{ top: 10, right: 18, left: -18, bottom: 0 }}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="#edf0f3"
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "#8a919c", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    domain={[0, 8]}
                    ticks={[0, 2, 4, 6, 8]}
                    tick={{ fill: "#8a919c", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(134, 199, 121, 0.08)" }}
                    formatter={(value) => [`${value}`, "Response"]}
                  />
                  <Bar dataKey="count" fill="#84c676" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="dashboard-side-cards">
            {sideStats.map((item) => {
              const Icon = item.icon;

              return (
                <div className="side-summary-card" key={item.label}>
                  <div className="stat-icon-wrap compact">
                    <Icon size={16} />
                  </div>
                  <p className="side-summary-label">{item.label}</p>
                  <p className="side-summary-value">{item.value}</p>
                  <p
                    className={
                      item.mutedTrend
                        ? "side-summary-note muted"
                        : "side-summary-note"
                    }
                  >
                    {!item.mutedTrend &&
                      (item.trendDirection === "down" ? (
                        <TrendingDown size={12} className="trend-arrow" />
                      ) : (
                        <TrendingUp size={12} className="trend-arrow" />
                      ))}
                    {item.trend}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
