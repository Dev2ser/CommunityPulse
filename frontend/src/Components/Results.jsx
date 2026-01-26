import React, { useState, useEffect } from "react";
import "../Styles/Results.css";
import BarGraph from "./BarGraph";

const Results = () => {
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [categoryCount, setCategoryCount] = useState(0);
  const [totalResponses, setTotalResponses] = useState(0);
  const [currenQuestion, setCurrentQuestion] = useState(null);
  const [themes, setThemes] = useState([]);
  const [barData, setBarData] = useState([]);

  // Fetch published + archived surveys on mount
  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/publishedAndArchivedSurveys");
        const data = await response.json();
        setSurveys(data.surveys);
        if (data.surveys.length > 0) setSelectedSurvey(data.surveys[0]);
      } catch (err) {
        console.error("Error fetching surveys:", err);
      }
    };
    fetchSurveys();
  }, []);

  // Fetch category count whenever selectedSurvey changes
  useEffect(() => {
    if (!selectedSurvey) return;

    const fetchCategoryCount = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/survey/categories/count/${encodeURIComponent(selectedSurvey.surveyTitle)}`
        );
        const data = await response.json();
        setCategoryCount(data.categoryCount || 0);
      } catch (err) {
        console.error("Error fetching category count:", err);
        setCategoryCount(0);
      }
    };

    fetchCategoryCount();
  }, [selectedSurvey]);

  useEffect(() => {
    if (!selectedSurvey) return;
  
    const fetchTotalResponses = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/survey/responseCount/${encodeURIComponent(selectedSurvey.surveyTitle)}`
        );
        const data = await response.json();
        setTotalResponses(data.totalResponses || 0);
      } catch (err) {
        console.error("Error fetching total responses:", err);
        setTotalResponses(0);
      }
    };
  
    fetchTotalResponses();
  }, [selectedSurvey]);

  // Fetch themes (topWords) whenever selectedSurvey changes
  useEffect(() => {
    if (!selectedSurvey) return;

    const fetchThemes = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/survey/themes/${encodeURIComponent(selectedSurvey.surveyTitle)}`
        );
        const data = await response.json();
        const themeWords = data.themes.map(t => t.word);
        setThemes(themeWords);
      } catch (err) {
        console.error("Error fetching themes:", err);
        setThemes([]);
      }
    };

    fetchThemes();
  }, [selectedSurvey]);

  // Fetch multiple-choice counts for the selected survey to generate BarGraph
  useEffect(() => {
    if (!selectedSurvey) return;

    const fetchBarData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/survey/multipleCounts/${encodeURIComponent(selectedSurvey.surveyTitle)}`
        );
        const data = await response.json();
        console.log(data);
        
        // Transform multipleCounts into an array for BarGraph
        const graphData = [];
        Object.keys(data.multipleCounts || {}).forEach((question) => {
          const counts = data.multipleCounts[question];
          Object.keys(counts).forEach((answer) => {
            graphData.push({
              option: `${answer}`,
              count: counts[answer],
            });
          });
        });

        setBarData(graphData);
        setCurrentQuestion(data.questions ? data.questions[0] : null);
      } catch (err) {
        console.error("Error fetching multiple-choice counts:", err);
        setBarData([]);
      }
    };

    fetchBarData();
  }, [selectedSurvey]);

  return (
    <div className="results-page">
      <header className="results-header">
      <h1 className="results-title">
  <div className="dropdown-wrapper">
    <select
      value={selectedSurvey?._id || ""}
      onChange={(e) =>
        setSelectedSurvey(
          surveys.find((s) => s._id === e.target.value)
        )
      }
      className="title-dropdown"
    >
      {surveys.map((survey) => (
        <option key={survey._id} value={survey._id}>
          {survey.surveyTitle}
        </option>
      ))}
    </select>
    <span className="dropdown-arrow">▼</span>
  </div>
</h1>

        <p className="results-subtitle">Tipping Point – Real Estate Development</p>
      </header>

      <section className="results-metrics">
        <div className="metric-card">
          <h2>{totalResponses}</h2>
          <p>Total Responses</p>
          <span className="metric-note">AI analyzed</span>
        </div>
        <div className="metric-card">
          <h2>84%</h2>
          <p>Completion Rate</p>
          <span className="metric-note">Above average</span>
        </div>
        <div className="metric-card">
          <h2>10</h2>
          <p>Most Mentioned Themes</p>
          <span className="metric-note">AI analyzed</span>
        </div>
        <div className="metric-card export-buttons">
          <button className="export-btn">Export CSV</button>
          <button className="export-btn">Export PDF</button>
        </div>
      </section>

      {/* Bar Graph Section */}
      <section className="results-graph-section">
        <h3 className="section-heading">Multiple Choice Responses</h3>
        <div className = "question-label">{currenQuestion}</div>
        {barData.length > 0 ? (
          <BarGraph data={barData} />
        ) : (
          <p>No multiple-choice responses available for this survey.</p>
        )}
      </section>

      {/* Dynamic Themes Section */}
      <section className="results-themes-section">
        <h3 className="section-heading">Top Mentioned Themes</h3>
        <div className="themes-grid">
          {themes.length > 0 ? (
            themes.map((theme, idx) => (
              <div key={idx} className="theme-tag">{theme}</div>
            ))
          ) : (
            <p>No themes available for this survey.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Results;
