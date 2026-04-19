import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/AvailableSurveys.css";
import { buildApiUrl } from "../utils/api";
import brandLogo from "../assets/TP_Wide_BlackGreen_NoST.png";
import { ChevronRight } from "lucide-react";

function AvailableSurveys() {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch surveys from backend
  useEffect(() => {
    async function fetchSurveys() {
      try {
        const res = await fetch(buildApiUrl("/api/publishedSurveys"));
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch surveys");
        }

        setSurveys(data.surveys || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSurveys();
  }, []);

  const openSurvey = (survey) => {
    console.log("Selected survey object:", survey);
    // Navigate to SurveyChat and pass the full survey object
    navigate("/survey-chat", { state: { survey } });
  };

  const goBack = () => {
    navigate("/");
  };

  return (
    <div className="surveys-page">
      <header className="surveys-topbar">
        <div className="surveys-topbar-inner">
          <button
            type="button"
            className="surveys-back"
            onClick={goBack}
            aria-label="Go back"
          >
            <span className="surveys-back-glyph" aria-hidden="true">
              &larr;
            </span>
          </button>

          <img
            src={brandLogo}
            alt="Tipping Point Real Estate Development"
            className="surveys-brand-logo"
          />

          <span className="surveys-topbar-spacer" aria-hidden="true" />
        </div>
      </header>

      <main className="surveys-content">
        <section className="surveys-intro">
          <h2 className="surveys-title">CHOOSE A SURVEY TO BEGIN</h2>
          <p className="surveys-subtitle">
            These surveys are part of ongoing community projects. Select the one
            for your area.
          </p>
        </section>

        <section className="surveys-cards-section">
          {loading && <p className="surveys-state">Loading surveys...</p>}
          {error && (
            <p className="surveys-state surveys-state-error">Error: {error}</p>
          )}
          {!loading && !error && surveys.length === 0 && (
            <p className="surveys-state">No surveys found.</p>
          )}

          {!loading && !error && surveys.length > 0 && (
            <div className="surveys-list">
              {surveys.map((s) => (
                <button
                  key={s._id}
                  className="survey-card"
                  onClick={() => openSurvey(s)}
                >
                  <div className="survey-text">
                    <div className="survey-title">{s.surveyTitle}</div>
                    <div className="survey-location">
                      {s.targetNeighborhood || "All"}
                    </div>
                  </div>
                  <div className="survey-arrow" aria-hidden="true">
                    <ChevronRight size={19} strokeWidth={2.2} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AvailableSurveys;
