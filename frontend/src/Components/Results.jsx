import React, { useState, useEffect, useRef } from "react";
import "../Styles/Results.css";
import BarGraph from "./BarGraph";
import PieChartComponent from "./PieChart";
import Spinner from "./Spinner";
import { ChevronDown } from "lucide-react";
import html2pdf from "html2pdf.js";
import Papa from "papaparse";
import { buildApiUrl } from "../utils/api";
import { showToast } from "../utils/toast";
const Results = () => {
  const [loading, setLoading] = useState(true);
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [totalResponses, setTotalResponses] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  const [sentimentScore, setSentimentScore] = useState(0);
  const [sentimentLabel, setSentimentLabel] = useState("");
  const [themes, setThemes] = useState([]);
  const [barData, setBarData] = useState([]);
  const [currentBarIndex, setCurrentBarIndex] = useState(0);
  const [chartType, setChartType] = useState("bar");
  const [responseType, setResponseType] = useState("Multiple Choice Responses");
  const [imageAnalysis, setImageAnalysis] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSurveyDropdownOpen, setIsSurveyDropdownOpen] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const dropdownRef = useRef(null);
  const resultsReportRef = useRef(null);

  // Fetch published + archived surveys on mount
  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await fetch(
          buildApiUrl("/api/publishedAndArchivedSurveys"),
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

  // Fetch sentiment
  useEffect(() => {
    if (!selectedSurvey) return;

    const fetchSentiment = async () => {
      try {
        const response = await fetch(
          buildApiUrl(
            `/api/survey/analytics/${encodeURIComponent(
              selectedSurvey.surveyTitle,
            )}`,
          ),
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
          buildApiUrl(
            `/api/survey/responseCount/${encodeURIComponent(
              selectedSurvey.surveyTitle,
            )}`,
          ),
        );
        const data = await response.json();
        setTotalResponses(data.totalResponses || 0);
        setCompletionRate(
          typeof data.completionRate === "number" ? data.completionRate : 0,
        );
      } catch (err) {
        console.error("Error fetching total responses:", err);
        setTotalResponses(0);
        setCompletionRate(0);
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
          buildApiUrl(
            `/api/survey/themes/${encodeURIComponent(
              selectedSurvey.surveyTitle,
            )}`,
          ),
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
          buildApiUrl(
            `/api/survey/multipleCounts/${encodeURIComponent(
              selectedSurvey.surveyTitle,
            )}`,
          ),
        );
        const data = await response.json();
        setLoading(false);
        const graphData = Object.keys(data.multipleCounts || {}).map(
          (question) => ({
            question,
            options: Object.entries(data.multipleCounts[question]).map(
              ([answer, count]) => ({
                option: answer,
                count,
              }),
            ),
          }),
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

  //image responses
  useEffect(() => {
    if (!selectedSurvey) return;

    const fetchImageResponses = async () => {
      try {
        const response = await fetch(
          buildApiUrl(
            `/api/survey/imageResponses/${encodeURIComponent(
              selectedSurvey.surveyTitle,
            )}`,
          ),
        );

        const data = await response.json();
        console.log("Fetched image responses:", data);

        setImageAnalysis(data.imageData || []);
        setCurrentImageIndex(0);
      } catch (err) {
        console.error("Error fetching image responses:", err);
        setImageAnalysis([]);
      }
    };

    fetchImageResponses();
  }, [selectedSurvey]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(event.target)) {
        setIsSurveyDropdownOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsSurveyDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleSelectSurvey = (survey) => {
    setSelectedSurvey(survey);
    setIsSurveyDropdownOpen(false);
  };

  const handleExportCSV = async () => {
    if (!selectedSurvey?.surveyTitle) {
      showToast("Please select a survey first", "info");
      return;
    }

    try {
      setExportingCsv(true);
      const res = await fetch(
        buildApiUrl(
          `/api/survey/responsesAndFollowups/${encodeURIComponent(
            selectedSurvey.surveyTitle,
          )}`,
        ),
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

      const csv = Papa.unparse(rows);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedSurvey.surveyTitle}-results.csv`;
      link.click();

      URL.revokeObjectURL(url);
      showToast("CSV exported successfully", "success");
    } catch (err) {
      console.error("Results CSV export failed:", err);
      showToast(err.message || "Failed to export CSV", "error");
    } finally {
      setExportingCsv(false);
    }
  };

  const handleExportPDF = async () => {
    if (!resultsReportRef.current) {
      showToast("Unable to generate PDF right now", "error");
      return;
    }

    if (!selectedSurvey?.surveyTitle) {
      showToast("Please select a survey first", "info");
      return;
    }

    try {
      setExportingPdf(true);

      const dateNode = document.createElement("p");
      dateNode.className = "results-pdf-generated-at";
      dateNode.textContent = `Generated on: ${new Date().toLocaleString()}`;
      resultsReportRef.current.appendChild(dateNode);

      const options = {
        margin: 0.5,
        filename: `${selectedSurvey.surveyTitle}-results.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      };

      await html2pdf().set(options).from(resultsReportRef.current).save();
      showToast("PDF exported successfully", "success");
    } catch (err) {
      console.error("Results PDF export failed:", err);
      showToast("Failed to export PDF", "error");
    } finally {
      const stamp = resultsReportRef.current?.querySelector(
        ".results-pdf-generated-at",
      );
      if (stamp) stamp.remove();
      setExportingPdf(false);
    }
  };

  return loading ? (
    <Spinner />
  ) : (
    <div className="results-page" ref={resultsReportRef}>
      <header className="results-header">
        <h1 className="results-title">
          <div className="dropdown-wrapper" ref={dropdownRef}>
            <button
              type="button"
              className="title-dropdown-trigger"
              onClick={() => setIsSurveyDropdownOpen((open) => !open)}
              aria-haspopup="listbox"
              aria-expanded={isSurveyDropdownOpen}
            >
              <span className="title-dropdown-text">
                {selectedSurvey?.surveyTitle || "Select Survey"}
              </span>

              <span
                className={`dropdown-arrow ${isSurveyDropdownOpen ? "open" : ""}`}
                aria-hidden="true"
              >
                <ChevronDown size={16} strokeWidth={2.5} />
              </span>
            </button>

            {isSurveyDropdownOpen && (
              <div className="survey-options-panel" role="listbox">
                {surveys.map((survey) => (
                  <button
                    key={survey._id}
                    type="button"
                    role="option"
                    aria-selected={selectedSurvey?._id === survey._id}
                    className={`survey-option-item ${
                      selectedSurvey?._id === survey._id ? "active" : ""
                    }`}
                    onClick={() => handleSelectSurvey(survey)}
                  >
                    {survey.surveyTitle}
                  </button>
                ))}
              </div>
            )}
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
          <button
            className="export-btn"
            onClick={handleExportCSV}
            disabled={exportingCsv}
          >
            {exportingCsv ? "Exporting..." : "Export CSV"}
          </button>
          <button
            className="export-btn"
            onClick={handleExportPDF}
            disabled={exportingPdf}
          >
            {exportingPdf ? "Exporting..." : "Export PDF"}
          </button>
        </div>
      </section>

      {/* Bar Graph Section */}
      <section className="results-graph-section">
        <div className="heading-container">
          {/* TOP TABS */}
          <div className="response-tabs">
            <button
              className={
                responseType === "Multiple Choice Responses" ? "active" : ""
              }
              onClick={() => setResponseType("Multiple Choice Responses")}
            >
              Multiple Choice
            </button>

            <button
              className={
                responseType === "Image-Based Analysis" ? "active" : ""
              }
              onClick={() => setResponseType("Image-Based Analysis")}
            >
              Image Responses
            </button>
          </div>

          {/* ONLY SHOW FOR MULTIPLE CHOICE */}
          {responseType === "Multiple Choice Responses" && (
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
          )}
        </div>

        {responseType === "Multiple Choice Responses" ? (
          barData.length > 0 ? (
            <div className="carousel-container">
              {/* QUESTION TABS */}
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

              {/* GRAPH */}
              <div className="carousel-slide">
                <div className="question-label">
                  {barData[currentBarIndex].question}
                </div>

                {chartType === "bar" ? (
                  <BarGraph
                    data={barData[currentBarIndex].options}
                    title={null}
                  />
                ) : (
                  <PieChartComponent
                    data={barData[currentBarIndex].options}
                    title={null}
                  />
                )}
              </div>
            </div>
          ) : (
            <p>No multiple-choice responses available for this survey.</p>
          )
        ) : imageAnalysis.length > 0 ? (
          <div className="carousel-container">
            {/* QUESTION TABS */}
            <div className="question-tabs">
              {imageAnalysis.map((_, idx) => (
                <button
                  key={idx}
                  className={`question-tab ${
                    idx === currentImageIndex ? "active" : ""
                  }`}
                  onClick={() => setCurrentImageIndex(idx)}
                >
                  Q{idx + 1}
                </button>
              ))}
            </div>

            {/* IMAGE ANALYSIS CONTENT */}
            <div className="carousel-slide">
              <div className="question-label">
                {imageAnalysis[currentImageIndex].question}
              </div>

              <div className="image-analysis-list">
                {imageAnalysis[currentImageIndex].responses.map((item, idx) => (
                  <div key={idx} className="analysis-card">
                    <p className="analysis-text">{item.analysis}</p>
                    <span className="analysis-date">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p>No image responses available for this survey.</p>
        )}
      </section>

      {/* Themes Section */}
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
