import React, { useState, useEffect } from "react";
import "../Styles/Exports.css";
import loginTippingPointLogo from "../assets/loginTippingPointLogo.png";

export default function Exports() {
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [surveyData, setSurveyData] = useState(null); 
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [loadingSurveys, setLoadingSurveys] = useState(true);

  // Fetch all surveys
  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        setLoadingSurveys(true);
        const res = await fetch("http://localhost:5001/api/surveys");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch surveys");
        setSurveys(data.surveys || []);
      } catch (err) {
        console.error(err);
        alert("Error fetching surveys: " + err.message);
      } finally {
        setLoadingSurveys(false);
      }
    };

    fetchSurveys();
  }, []);

  // Fetch survey responses + analytics
  const fetchSurveyData = async (surveyTitle) => {
    try {
      setLoadingResponses(true);

      if (!surveyTitle) throw new Error("Survey title is missing");
      console.log(surveyTitle);

      const res = await fetch(
        `http://localhost:5001/api/survey/responses/${encodeURIComponent(surveyTitle)}`
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Analytics failed");

      setSurveyData(data); // contains responses, topWords, sentiment
    } catch (err) {
      console.error(err);
      alert("Error fetching survey data: " + err.message);
    } finally {
      setLoadingResponses(false);
    }
  };

  const fetchSurveyAnalytics = async (surveyTitle) => {
    try {
      setLoadingResponses(true);

      if (!surveyTitle) throw new Error("Survey title is missing");
      console.log(surveyTitle);

      const res = await fetch(
        `http://localhost:5001/api/survey/analytics/${encodeURIComponent(surveyTitle)}`
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Analytics failed");

      setSurveyData(data); // contains responses, topWords, sentiment
    } catch (err) {
      console.error(err);
      alert("Error fetching survey data: " + err.message);
    } finally {
      setLoadingResponses(false);
    }
  };

  // Handle Generate Report
  const handleGenerateSurvey = async (survey) => {
    setSelectedSurvey(survey);
    setSurveyData(null);
 
    await fetchSurveyData(survey.surveyTitle);
    alert("report generated!");
  };

  const handleViewSurveyAnalytics = async (survey) => {
    setSelectedSurvey(survey);
    setSurveyData(null);
    await fetchSurveyAnalytics(survey.surveyTitle);
    setShowModal(true)
  };

  // Close modal
  const handleCloseModal = () => {
    setSelectedSurvey(null);
    setSurveyData(null);
    setShowModal(false);
  };

  return (
    <div className="exports-page">
      <div className="exports-header">
        <div>
          <h1 className="exports-title">Survey Reports</h1>
          <p className="exports-subtitle">Generate and review your exports</p>
        </div>
      </div>

      {loadingSurveys ? (
        <p>Loading surveys...</p>
      ) : (
        <div className="exports-grid single-column">
          <div className="export-list-card">
            <h2 className="export-list-title">Reports</h2>
            <div className="reports-list">
              {surveys.length === 0 && <p>No surveys found.</p>}

              {surveys.map((survey) => (
                <div key={survey._id} className="report-card">
                  <div className="report-header">
                    <div>
                      <h3>{survey.surveyTitle}</h3>
                      <p className="report-date">
                        Date: {new Date(survey.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="status">{survey.status || "Unknown"}</span>
                  </div>

                  <div className="report-actions">
                    <button
                    className = "btn secondary"
                    onClick={() => handleGenerateSurvey(survey)}
                    >
                      Generate Report
                    </button>
                    <button
                      className="btn secondary"
                      onClick={() => handleViewSurveyAnalytics(survey)}
                    >
                      View Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal for responses + analytics */}
      {showModal && selectedSurvey && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="top-row">
            <h2 className="modal-title">{selectedSurvey.surveyTitle}</h2>
            <img 
  src={loginTippingPointLogo}
  alt="Tipping Point Logo"
  className="tippingpoint-logo"
/>
          </div>
            {loadingResponses ? (
              <p>Loading responses...</p>
            ) : surveyData ? (
              <div className="responses-analytics">
               
                <h3>Analytics</h3>
                <p>
                  <strong>Sentiment:</strong> {surveyData.sentiment}
                </p>
                <p>
                  <strong>Top Words:</strong>{" "}
                  {surveyData.topWords?.map((w) => w.word).join(", ")}
                </p>
                <h3>Suggestions</h3>
                {surveyData.suggestions.length ? (
                <ul>
                  {surveyData.suggestions.map((s, i) => (
               <li key={i}>{s}</li>
                ))}
              </ul>
              ) : (
          <p>No suggestions available.</p>
            )}
              </div>
            ) : (
              <p>No responses yet.</p>
            )}

            <button className="btn danger" onClick={handleCloseModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
