import React from "react";
import "../Styles/Results.css";
import BarGraph from "../Components/BarGraph";

const Results = () => {
  const satisfactionData = [
    { option: "Very Satisfied", count: 140 },
    { option: "Satisfied", count: 60 },
    { option: "Neutral", count: 30 },
    { option: "Unsatisfied", count: 10 },
  ];

  const themes = [
    "AMENITIES", "PARKING", "MAINTENANCE", "COMMUNITY", "EVENTS",
    "SAFETY", "CLEANLINESS", "STAFF", "LOCATION", "NOISE",
    "SECURITY", "FACILITIES"
  ];

  return (
    <div className="results-page">
      <header className="results-header">
        <h1 className="results-title">Q1 2025 Community Feedback</h1>
        <p className="results-subtitle">Tipping Point – Real Estate Development</p>
      </header>

      <section className="results-metrics">
        <div className="metric-card">
          <h2>234</h2>
          <p>Total Responses</p>
          <span className="metric-note">+18 today</span>
        </div>
        <div className="metric-card">
          <h2>84%</h2>
          <p>Completion Rate</p>
          <span className="metric-note">Above average</span>
        </div>
        <div className="metric-card">
          <h2>5</h2>
          <p>Most Mentioned Themes</p>
          <span className="metric-note">AI analyzed</span>
        </div>
        <div className="metric-card export-buttons">
          <button className="export-btn">Export CSV</button>
          <button className="export-btn">Export PDF</button>
        </div>
      </section>

      <section className="results-graph-section">
        <h3 className="section-heading">Satisfaction with Community Amenities</h3>
        <BarGraph data={satisfactionData} />
      </section>

      <section className="results-themes-section">
        <h3 className="section-heading">Top Mentioned Themes</h3>
        <div className="themes-grid">
          {themes.map((theme, idx) => (
            <div key={idx} className="theme-tag">{theme}</div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Results;
