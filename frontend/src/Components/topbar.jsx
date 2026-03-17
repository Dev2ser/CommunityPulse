import React, { useState, useRef, useEffect } from "react";
import "../Styles/topbar.css";
import userIcon from "../assets/user.png";

const pageTitles = {
  home: "Dashboard",
  dashboard: "Dashboard",
  adminSurveys: "Surveys",
  results: "Results",
  exports: "Exports",
  settings: "Admin Settings",
  createSurvey: "Create Survey",
  
};

export default function TopBar({ currentPage, onNavigate, onLogout, pageMode   }) {
  const[username, setUsername] = useState(localStorage.getItem("username") || "Admin User");
  const [role, setRole] = useState(localStorage.getItem("userRole") || "Administrator");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  let title = pageTitles[currentPage] || "Dashboard";

if (currentPage === "createSurvey" && pageMode === "edit") {
  title = "Edit Survey";
}

title = title.toUpperCase();

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <header>
    <div className="topbar">

      {/* LEFT PLACEHOLDER - keeps center text truly centered */}
      <div className="topbar-left"></div>

      {/* CENTER */}
      <div className="topbar-center">
        <h1 className="topbar-title">
        {title}
        </h1></div>

      {/* RIGHT */}
      <div className="topbar-right">
        <div className="topbar-usertext">
          <div className="topbar-username">{username}</div>
          <div className="topbar-role">{role}</div>
        </div>
        <div className="topbar-avatar" ref={menuRef}>
          <img
            src={userIcon}
            alt="user icon"
            className="topbar-usericon"
            onClick={() => setMenuOpen((v) => !v)}
          />
          {menuOpen && (
            <div className="topbar-dropdown">
              <button
                className="dropdown-item"
                onClick={() => {
                  setMenuOpen(false);
                  if (onLogout) {
                    onLogout();
                  } else {
                    onNavigate("login");
                  }
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
    </header>
  );
}
