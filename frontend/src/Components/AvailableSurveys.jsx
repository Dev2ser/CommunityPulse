import React from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/AvailableSurveys.css";

function AvailableSurveys() {
  const navigate = useNavigate();

  const surveys = [
    { title: "WHEELING GATEWAY CENTER", location: "Wheeling WV" },
    { title: "ROBINSON FANS", location: "Lakeland FL" },
    { title: "RENEWALL", location: "Huntington WV" },
    { title: "INNOVATION DISTRICT", location: "Myrtle Beach SC" },
    { title: "MEMPHIS AND PEARL", location: "Cleveland OH" },
    { title: "CLAY SCHOOL", location: "Wheeling WV" },
    { title: "BRITE", location: "Warren OH" }
  ];

  const openSurvey = (surveyTitle) => {
    // Navigate to the SurveyChat page
    // Optionally pass survey info via state
    navigate("/survey-chat", { state: { surveyTitle } });
  };

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
        {surveys.map((s, i) => (
          <button
            key={i}
            className="survey-card"
            onClick={() => openSurvey(s.title)}
          >
            <div className="survey-text">
              <div className="survey-title">{s.title}</div>
              <div className="survey-location">{s.location}</div>
            </div>
            <div className="survey-arrow">›</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default AvailableSurveys;


