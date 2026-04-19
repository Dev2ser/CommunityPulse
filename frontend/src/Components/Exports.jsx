import React, { useState, useEffect, useMemo, useRef } from "react";
import "../Styles/Exports.css";
import loginTippingPointLogo from "../assets/loginTippingPointLogo.png";
import Spinner from "./Spinner.jsx";
import {
  Eye,
  Download,
  FileText,
  Search,
  CheckCircle2,
  Archive,
  X,
} from "lucide-react";
//pdf library
import html2pdf from "html2pdf.js";
//csv library
import Papa from "papaparse";
import { buildApiUrl } from "../utils/api";
import { showToast } from "../utils/toast";

export default function Exports() {
  const [surveys, setSurveys] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [responseCounts, setResponseCounts] = useState({});
  const [generatedReports, setGeneratedReports] = useState({});
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [surveyData, setSurveyData] = useState(null); 
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [loadingSurveys, setLoadingSurveys] = useState(true);
  const [loadingAction, setLoadingAction] = useState(null);
  const [loadingSurveyId, setLoadingSurveyId] = useState(null);
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
        buildApiUrl(`/api/survey/responsesandfollowups/${encodeURIComponent(
          survey.surveyTitle
        )}`)
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to export CSV");
      }
  
      const data = await res.json();
      const rows = Array.isArray(data?.rows) ? data.rows : [];

      if (rows.length === 0) {
        showToast("No data available to export for this survey", "info");
        return;
      }

      const csv = Papa.unparse(data.rows);
  
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
  
      const link = document.createElement("a");
      link.href = url;
      link.download = `${survey.surveyTitle}-responses.csv`;
      link.click();
  
      URL.revokeObjectURL(url);
        showToast("CSV exported successfully", "success");
    } catch (err) {
      console.error("CSV export failed:", err);
        showToast(err.message || "CSV export failed", "error");
    }
  };
  
  // Fetch all surveys
  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        setLoadingSurveys(true);
        const res = await fetch(buildApiUrl("/api/surveys"));
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch surveys");
        setSurveys(data.surveys || []);
      } catch (err) {
        console.error(err);
        showToast(`Error fetching surveys: ${err.message}`, "error");
      } finally {
        setLoadingSurveys(false);
      }
    };

    fetchSurveys();
  }, []);

  useEffect(() => {
    const fetchResponseCounts = async () => {
      if (surveys.length === 0) {
        setResponseCounts({});
        return;
      }

      try {
        const results = await Promise.all(
          surveys.map(async (survey) => {
            try {
              const res = await fetch(
                buildApiUrl(
                  `/api/survey/responseCount/${encodeURIComponent(survey.surveyTitle)}`,
                ),
              );
              if (!res.ok) throw new Error("count fetch failed");
              const data = await res.json();
              return [survey._id, data.totalResponses || 0];
            } catch {
              return [survey._id, 0];
            }
          }),
        );

        setResponseCounts(Object.fromEntries(results));
      } catch (err) {
        console.error("Failed to fetch response counts:", err);
      }
    };

    fetchResponseCounts();
  }, [surveys]);

  useEffect(() => {
    const fetchGeneratedReportsStatus = async () => {
      if (surveys.length === 0) {
        setGeneratedReports({});
        return;
      }

      try {
        const res = await fetch(buildApiUrl("/api/survey/reportsGenerated"));
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Failed to fetch generated reports status");

        const generatedByTitle = new Set(
          (data.surveys || [])
            .map((item) => item?.surveyTitle)
            .filter(Boolean),
        );

        const generatedBySurveyId = {};
        surveys.forEach((survey) => {
          generatedBySurveyId[survey._id] = generatedByTitle.has(survey.surveyTitle);
        });

        setGeneratedReports(generatedBySurveyId);
      } catch (err) {
        console.error("Failed to fetch generated reports status:", err);
      }
    };

    fetchGeneratedReportsStatus();
  }, [surveys]);

  // Fetch survey responses + analytics
  const fetchSurveyData = async (surveyTitle) => {
    try {
      setLoadingResponses(true);

      if (!surveyTitle) throw new Error("Survey title is missing");
      console.log(surveyTitle);

      const res = await fetch(
        buildApiUrl(`/api/survey/responses/${encodeURIComponent(surveyTitle)}`)
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Analytics failed");
      console.log(data);
      setSurveyData(data); // contains responses, topWords, sentiment, categories
      return true;
    } catch (err) {
      console.error(err);
      showToast(`Error fetching survey data: ${err.message}`, "error");
      return false;
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
        buildApiUrl(`/api/survey/analytics/${encodeURIComponent(surveyTitle)}`)
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Analytics failed");

      setSurveyData(data); // contains responses, topWords, sentiment
      console.log(data);
      return true;
    } catch (err) {
      console.error(err);
      showToast(`Error fetching survey data: ${err.message}`, "error");
      return false;
    } finally {
      setLoadingResponses(false);
    }
  };

  // Handle Generate Report
  const handleGenerateSurvey = async (survey) => {
    setSelectedSurvey(survey);
    setSurveyData(null);

    setLoadingAction("generate");
    setLoadingSurveyId(survey._id);

    try {
      const generated = await fetchSurveyData(survey.surveyTitle);
      if (!generated) return;

      setGeneratedReports((prev) => ({ ...prev, [survey._id]: true }));
      showToast("Report generated successfully", "success");
    } finally {
      setLoadingAction(null);
      setLoadingSurveyId(null);
    }
  };

  const handleViewSurveyAnalytics = async (survey) => {
    setSelectedSurvey(survey);
    setSurveyData(null);

    setLoadingAction("view");
    setLoadingSurveyId(survey._id);

    try {
      const loaded = await fetchSurveyAnalytics(survey.surveyTitle);
      if (!loaded) return;

      setShowModal(true);
    } finally {
      setLoadingAction(null);
      setLoadingSurveyId(null);
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setSelectedSurvey(null);
    setSurveyData(null);
    setShowModal(false);
  };

  const filteredSurveys = useMemo(() => {
    return surveys
      .filter((survey) => {
        const title = (survey.surveyTitle || "").toLowerCase();
        const matchesSearch = title.includes(searchTerm.toLowerCase());
        const currentStatus = (survey.status || "unknown").toLowerCase();
        const matchesStatus =
          statusFilter === "all" || statusFilter === currentStatus;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [surveys, searchTerm, statusFilter]);

  const publishedCount = useMemo(
    () => surveys.filter((s) => (s.status || "").toLowerCase() === "published").length,
    [surveys],
  );

  const archivedCount = useMemo(
    () => surveys.filter((s) => (s.status || "").toLowerCase() === "archived").length,
    [surveys],
  );

  const reportsGeneratedCount = useMemo(
    () => Object.values(generatedReports).filter(Boolean).length,
    [generatedReports],
  );

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString();
  };

  return (
    <div className="exports-page">
      <div className="exports-header">
        <div>
          <h1 className="exports-title">Survey Reports</h1>
          <p className="exports-subtitle">
            Generate and review exported reports for all community surveys
          </p>
        </div>
      </div>

      {loadingSurveys ? (
        <p>Loading surveys...</p>
      ) : (
        <div className="exports-grid single-column">
          <div className="exports-controls-row">
            <div className="exports-search-wrap">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="exports-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
              <option value="draft">Draft</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>

          <div className="exports-summary-cards">
            <div className="exports-summary-card">
              <div className="summary-icon-wrap">
                <CheckCircle2 size={16} />
              </div>
              <div className="summary-value">{publishedCount}</div>
              <div className="summary-label">Published</div>
            </div>
            <div className="exports-summary-card">
              <div className="summary-icon-wrap">
                <Archive size={16} />
              </div>
              <div className="summary-value">{archivedCount}</div>
              <div className="summary-label">Archived</div>
            </div>
            <div className="exports-summary-card">
              <div className="summary-icon-wrap">
                <Download size={16} />
              </div>
              <div className="summary-value">{reportsGeneratedCount}</div>
              <div className="summary-label">Reports Generated</div>
            </div>
          </div>

          <div className="export-list-card">
            <h2 className="export-list-title">Reports</h2>
            <div className="reports-list">
              {filteredSurveys.length === 0 && <p>No surveys found.</p>}

              {filteredSurveys.map((survey) => (
                <div key={survey._id} className="report-card">
                  <div className="report-main">
                    <div className="report-file-icon" aria-hidden="true">
                      <FileText size={16} />
                    </div>

                    <div className="report-meta">
                      <h3>{survey.surveyTitle}</h3>
                      <div className="report-meta-line">
                        <span>Date: {formatDate(survey.createdAt)}</span>
                        <span>{responseCounts[survey._id] || 0} responses</span>
                      </div>
                    </div>
                  </div>

                  <div className="report-header-right">
                    <span
                      className={`status ${(survey.status || "unknown").toLowerCase()}`}
                    >
                      <span className="status-dot" aria-hidden="true" />
                      {survey.status || "Unknown"}
                    </span>

                    <div className="report-actions">
                  {["Admin", "Super Admin"].includes(localStorage.getItem("userRole")) && (
                    <button
                    className="btn primary action-btn generate-btn"
                    onClick={() => handleGenerateSurvey(survey)}
                    disabled={loadingResponses}
                    >
                      {loadingAction === "generate" && loadingSurveyId === survey._id ? (
                        <>
                          <Spinner />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <FileText size={16} strokeWidth={2.2} />
                          <span>Generate Report</span>
                        </>
                      )}
                    </button>
                  )}
                    <button
                      className="btn secondary action-btn view-btn"
                      onClick={() => handleViewSurveyAnalytics(survey)}
                      disabled={loadingResponses}
                    >
                     {loadingAction === "view" && loadingSurveyId === survey._id ? (
                       <>
                         <Spinner />
                         <span>Loading...</span>
                       </>
                     ) : (
                       <>
                         <Eye size={16} strokeWidth={2.2} />
                         <span>View Report</span>
                       </>
                     )}
                    </button>
                    <button className="btn secondary action-btn" onClick={() => exportResponsesCSV(survey)}>
                      <Download size={16} strokeWidth={2.2} />
                      <span>Export CSV</span>
                    </button>
                    </div>
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
            <div className="modal-header">
              <div className="modal-header-copy">
                <h2 className="modal-title">{selectedSurvey.surveyTitle}</h2>
                <p className="modal-subtitle">
                  Generated insights and response analytics
                </p>
              </div>

              <div className="modal-header-actions">
                <img
                  src={loginTippingPointLogo}
                  alt="Tipping Point Logo"
                  className="tippingpoint-logo"
                  crossOrigin="anonymous"
                />
                <button
                  className="modal-close-btn"
                  onClick={handleCloseModal}
                  aria-label="Close report modal"
                >
                  <X className="modal-close-icon" size={18} strokeWidth={2.4} />
                </button>
              </div>
            </div>

            {loadingResponses ? (
              <div className="modal-loading-state">
                <Spinner />
                <p>Loading report...</p>
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
                <p className="modal-empty-text">No suggestions available.</p>
              )}
            </div>
            ) : (
              <p className="modal-empty-text">No responses yet.</p>
            )}

            <div className="modal-actions-row">
            <button className="modal-btn modal-btn-primary" onClick={handleExportPDF}>
              Export as PDF
            </button>
            <button className="modal-btn modal-btn-secondary" onClick={handleCloseModal}>
              Close
            </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
