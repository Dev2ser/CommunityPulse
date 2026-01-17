import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/AvailableSurveys.css";


function AvailableSurveys() {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // Fetch surveys from backend
  useEffect(() => {
    async function fetchSurveys() {
      try {
        const res = await fetch("http://localhost:5001/api/publishedSurveys");
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

  if (loading) return <p className="loading">Loading surveys...</p>;
  if (error) return <p className="error">Error: {error}</p>;
  if (surveys.length === 0) return <p>No surveys found.</p>;

  return (
    <div className="surveys-page">
      <header className="surveys-header">
        <h1 className="brand">TIPPING POINT</h1>
        <p className="brand-sub">REAL ESTATE DEVELOPMENT</p>

        <h2 className="surveys-title">CHOOSE A SURVEY TO BEGIN</h2>
        <p className="surveys-subtitle">
          These surveys are part of ongoing community projects. Select the one for your area.
        </p>
      </header>

      <div className="surveys-list">
        {surveys.map((s) => (
          <button
            key={s._id}
            className="survey-card"
            onClick={() => openSurvey(s)}
          >
            <div className="survey-text">
              <div className="survey-title">{s.title}</div>
              <div className="survey-location">{s.targetNeighborhood || "All"}</div>
            </div>
            <div className="survey-arrow">›</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default AvailableSurveys;



