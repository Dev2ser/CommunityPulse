import React, { useState, useEffect, useRef } from "react";
import "../Styles/Exports.css";
import loginTippingPointLogo from "../assets/loginTippingPointLogo.png";
import Spinner from "./Spinner.jsx";
//pdf library
import html2pdf from "html2pdf.js";
//csv library
import Papa from "papaparse";

export default function Exports() {
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [surveyData, setSurveyData] = useState(null); 
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [loadingSurveys, setLoadingSurveys] = useState(true);
  const reportRef = useRef();

  const handleExportPDF = () => {
    if (!reportRef.current) return;

    // Add the generated date dynamically
    const today = new Date().toLocaleString();
    
    // Create a date element
    const date = document.createElement("p");
    date.textContent = "Generated on: " + today;
    date.style.textAlign = "right";
    date.style.fontSize = "12px";
    const pdfContent = reportRef.current;
    pdfContent.appendChild(date);

    const options = {
      margin: 0.5,
      filename: `${selectedSurvey?.surveyTitle || "survey-report"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
    };

    html2pdf().set(options).from(reportRef.current).save();
    setShowModal(false);

  };

  const exportResponsesCSV = async (survey) => {
    try {
      const res = await fetch(
        `http://localhost:5001/api/survey/responsesandfollowups/${encodeURIComponent(
          survey.surveyTitle
        )}`
      );
  
      const data = await res.json();
      console.log(data)
      const csv = Papa.unparse(data.rows);
  
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
  
      const link = document.createElement("a");
      link.href = url;
      link.download = `${survey.surveyTitle}-responses.csv`;
      link.click();
  
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV export failed:", err);
    }
  };
  
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
      console.log(data);
      setSurveyData(data); // contains responses, topWords, sentiment, categories
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
      console.log(data);
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
                  {["Admin", "Super Admin"].includes(localStorage.getItem("userRole")) && (
                    <button
                    className = "btn secondary"
                    onClick={() => handleGenerateSurvey(survey)}
                    disabled={loadingResponses}
                    >
                      {loadingResponses ? <Spinner /> : "Generate Report"}
                    </button>
                  )}
                    <button
                      className="btn secondary"
                      onClick={() => handleViewSurveyAnalytics(survey)}
                      disabled={loadingResponses}
                    >
                     {loadingResponses ? <Spinner /> : "View Report"}
                    </button>
                    <button className = "btn secondary" onClick={() => exportResponsesCSV(survey)}>Export Raw Responses (CSV)</button>
                    
                    
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
        crossOrigin="anonymous"
          />
          </div>
          {loadingResponses ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
            <Spinner />
          <p>Generating report...</p>
          </div>
              ) : surveyData ? (
              <div className="responses-analytics" ref={reportRef}>
              <div className="section-title">Analytics</div>
              <div className="horizontal-line"></div>
              <div className="card sentiment-card">
              <span>Overall Sentiment:</span>  
            <span className={`sentiment-badge ${surveyData.sentimentLabel  || "Neutral"}`}>
            {surveyData.sentimentLabel || "No data"}
            </span>
              </div>
            
              <div className="card">
                <strong>Top Themes</strong>
                <p>{surveyData.topWords?.map((w) => w.word).join(", ")}</p>
              </div>
            
              <h3 className="section-title">Top Categories</h3>
              <div className="category-list">
          {surveyData.categories?.map((c, i) => (
           <div className="category-card" key={i}>
             <div className="rank-badge">{i + 1}</div>
            <div className="category-icon">{c.icon || "📊"}</div>

              <div className="category-content">
               <div className="category-name">{c.name}</div>
               <div className="category-words">{c.words.join(", ")}</div>
               </div>
            </div>
            ))}
            </div>
              <h3 className="section-title">Suggestions</h3>
              {surveyData.suggestions.length ? (
                <div className="suggestions-list">
                  {surveyData.suggestions.map((s, i) => (
                    <div className="suggestion-card" key={i}>
                      <div className="rank-badge">{i + 1}</div>
                      {s}
                    </div>
                  ))}
                  
                </div>
              ) : (
                <p>No suggestions available.</p>
              )}
            </div>
            ) : (
              <p>No responses yet.</p>
            )}
            <div className = "bottom-row">
            <button className = "btn export" onClick = {handleExportPDF}>Export as PDF</button>
            <button className="btn danger" onClick={handleCloseModal}>
              Close
            </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
