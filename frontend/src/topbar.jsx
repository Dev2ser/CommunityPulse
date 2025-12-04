import React from "react";
import "./topbar.css";
import userIcon from "./assets/user.png";

const pageTitles = {
  home: "Dashboard",
  dashboard: "Dashboard",
  adminSurveys: "Surveys",
  results: "Results",
  exports: "Exports",
  settings: "Admin Settings",
  createSurvey: "Create Survey",
};

export default function TopBar({ currentPage, onNavigate }) {
  const title = (pageTitles[currentPage] || "Dashboard").toUpperCase();

  return (
    <div className="topbar">

      {/* LEFT PLACEHOLDER - keeps center text truly centered */}
      <div className="topbar-left"></div>

      {/* CENTER */}
      <div className="topbar-center">{title}</div>

      {/* RIGHT */}
      <div className="topbar-right">
        <div className="topbar-usertext">
          <div className="topbar-username">Admin User</div>
          <div className="topbar-role">Administrator</div>
        </div>
        <img
          src={userIcon}
          alt="user icon"
          className="topbar-usericon"
          onClick={() => onNavigate("login")}
        />
      </div>

    </div>
  );
}
