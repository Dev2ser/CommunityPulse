import React from "react";
import "../Styles/topbar.css";

const pageTitles = {
  home: "Dashboard",
  dashboard: "Dashboard",
  adminSurveys: "Surveys",
  results: "Results",
  exports: "Exports",
  settings: "Admin Settings",
  createSurvey: "Create Survey",
};

export default function TopBar({ currentPage, pageMode, onMenuToggle }) {
  let title = pageTitles[currentPage] || "Dashboard";

  if (currentPage === "createSurvey" && pageMode === "edit") {
    title = "Edit Survey";
  }

  title = title.toUpperCase();

  return (
    <header className="topbar-wrap">
      <div className="topbar">
        <div className="topbar-left">
          <button
            type="button"
            className="topbar-menu-button"
            onClick={onMenuToggle}
            aria-label="Open navigation"
          >
            ☰
          </button>
        </div>

        <div className="topbar-center">
          <h1 className="topbar-title">{title}</h1>
        </div>

        <div className="topbar-right" aria-hidden="true" />
      </div>
    </header>
  );
}
