import React, { useState, useEffect } from "react";
import "../Styles/Results.css";
import BarGraph from "./BarGraph";
import PieChartComponent from "./PieChart";

const Results = () => {
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [categoryCount, setCategoryCount] = useState(0);
  const [totalResponses, setTotalResponses] = useState(0);
  const [sentimentScore, setSentimentScore] = useState(0);
  const [sentimentLabel, setSentimentLabel] = useState("");
  const [themes, setThemes] = useState([]);
  const [barData, setBarData] = useState([]);
  const [currentBarIndex, setCurrentBarIndex] = useState(0);
  const [chartType, setChartType] = useState("bar");

  // Fetch published + archived surveys on mount
  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await fetch(
          "http://localhost:5001/api/publishedAndArchivedSurveys"
        );
        const data = await response.json();
        setSurveys(data.surveys);
        if (data.surveys.length > 0) {
          setSelectedSurvey(data.surveys[0]);
        }
      } catch (err) {
        console.error("Error fetching surveys:", err);
      }
    };

    fetchSurveys();
  }, []);

  // Fetch category count
  useEffect(() => {
    if (!selectedSurvey) return;

    const fetchCategoryCount = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/survey/categories/count/${encodeURIComponent(
            selectedSurvey.surveyTitle
          )}`
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

  // Fetch sentiment
  useEffect(() => {
    if (!selectedSurvey) return;

    const fetchSentiment = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/survey/analytics/${encodeURIComponent(
            selectedSurvey.surveyTitle
          )}`
        );
        const data = await response.json();
        setSentimentScore(data.sentimentScore || 0);
        setSentimentLabel(data.sentimentLabel || "No data");
      } catch (err) {
        console.error("Error fetching sentiment:", err);
      }
    };

    fetchSentiment();
  }, [selectedSurvey]);

  // Fetch total responses
  useEffect(() => {
    if (!selectedSurvey) return;

    const fetchTotalResponses = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/survey/responseCount/${encodeURIComponent(
            selectedSurvey.surveyTitle
          )}`
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

  // Fetch themes
  useEffect(() => {
    if (!selectedSurvey) return;

    const fetchThemes = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/survey/themes/${encodeURIComponent(
            selectedSurvey.surveyTitle
          )}`
        );
        const data = await response.json();
        const themeWords = data.themes.map((t) => t.word);
        setThemes(themeWords);
      } catch (err) {
        console.error("Error fetching themes:", err);
        setThemes([]);
      }
    };

    fetchThemes();
  }, [selectedSurvey]);

  // Fetch multiple-choice counts
  useEffect(() => {
    if (!selectedSurvey) return;

    const fetchBarData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/survey/multipleCounts/${encodeURIComponent(
            selectedSurvey.surveyTitle
          )}`
        );
        const data = await response.json();

        const graphData = Object.keys(data.multipleCounts || {}).map(
          (question) => ({
            question,
            options: Object.entries(
              data.multipleCounts[question]
            ).map(([answer, count]) => ({
              option: answer,
              count,
            })),
          })
        );

        setBarData(graphData);
        setCurrentBarIndex(0);
      } catch (err) {
        console.error("Error fetching multiple-choice counts:", err);
        setBarData([]);
        setCurrentBarIndex(0);
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
        <p className="results-subtitle">
          Tipping Point – Real Estate Development
        </p>
      </header>

      {/* Metrics Section */}
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
          <h2>{sentimentScore}</h2>
          <p>Overall Sentiment</p>
          <span className="metric-note">{sentimentLabel}</span>
        </div>

        <div className="metric-card">
          <h2>{themes.length}</h2>
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
        <div className="heading-container">
          <h3 className="section-heading">Multiple Choice Responses</h3>

          <div className="chart-dropdown-wrapper">
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="chart-dropdown"
            >
              <option value="bar">Bar Chart</option>
              <option value="pie">Pie Chart</option>
            </select>
       
          </div>
        </div>

        {barData.length > 0 ? (
          <div className="carousel-container">
            <div className="question-tabs">
              {barData.map((_, idx) => (
                <button
                  key={idx}
                  className={`question-tab ${
                    idx === currentBarIndex ? "active" : ""
                  }`}
                  onClick={() => setCurrentBarIndex(idx)}
                >
                  Q{idx + 1}
                </button>
              ))}
            </div>

            <div className="carousel-slide">
              <div className="question-label">
                {barData[currentBarIndex].question}
              </div>

              {chartType === "bar" && (
                <BarGraph
                  data={barData[currentBarIndex].options}
                  title={null}
                />
              )}

              {chartType === "pie" && (
                <PieChartComponent
                  data={barData[currentBarIndex].options}
                  title={null}
                />
              )}
            </div>
          </div>
        ) : (
          <p>No multiple-choice responses available for this survey.</p>
        )}
      </section>

      <section className="results-themes-section">

  <div className="themes-row">
    {/* Top 5 */}
    <div className="trend-box">
      <h4 className="trend-box-title">Top 5 Trends</h4>
      <div className="themes-inline">
        {themes.slice(0, 5).map((theme, idx) => (
          <div key={idx} className="theme-tag">
            {idx + 1}. {theme}
          </div>
        ))}
      </div>
    </div>

    {/* Remaining */}
    <div className="trend-box">
      <h4 className="trend-box-title">Remaining Trends</h4>
      <div className="themes-inline">
        {themes.slice(5).map((theme, idx) => (
          <div key={idx} className="theme-tag">
            {theme}
          </div>
        ))}
      </div>
    </div>
  </div>
</section>




    </div>
  );
};

export default Results;
