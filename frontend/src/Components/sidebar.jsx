import "../Styles/sidebar.css";
import React from "react";
import {
  ChartColumn,
  ClipboardList,
  BarChart3,
  Download,
  Settings,
  LogOut,
} from "lucide-react";
import sidebarLogo from "../assets/TP_Stacked_BlackGreen.png";

export default function Sidebar({
  currentPage,
  isOpen,
  onClose,
  onNavigate,
  onLogout,
}) {
  const menuItems = [
    { name: "Dashboard", icon: ChartColumn, page: "dashboard" },
    { name: "Surveys", icon: ClipboardList, page: "adminSurveys" },
    { name: "Results", icon: BarChart3, page: "results" },
    { name: "Exports", icon: Download, page: "exports" },
    { name: "Admin Settings", icon: Settings, page: "settings" },
  ];

  return (
    <>
      <button
        type="button"
        className={`sidebar-backdrop ${isOpen ? "is-open" : ""}`}
        aria-label="Close navigation"
        onClick={onClose}
      />

      <aside className={`sidebar ${isOpen ? "is-open" : ""}`}>
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <button
              type="button"
              className="sidebar-close"
              onClick={onClose}
              aria-label="Close navigation"
            >
              ×
            </button>

            <div className="sidebar-brand-row">
              <img
                src={sidebarLogo}
                alt="Tipping Point"
                className="sidebar-logo"
              />
              <div className="sidebar-brand-text">
                <p className="community-pulse">CommunityPulse</p>
                <p className="survey-platform">Survey Platform</p>
              </div>
            </div>
          </div>

          <nav className="sidebar-nav" aria-label="Admin navigation">
            <ul>
              {menuItems.map((item) => {
                const Icon = item.icon;

                return (
                  <li key={item.name}>
                    <button
                      type="button"
                      onClick={() => onNavigate(item.page)}
                      className={`sidebar-item-button ${
                        currentPage === item.page ? "active" : ""
                      }`}
                    >
                      <Icon
                        size={18}
                        strokeWidth={2}
                        className="sidebar-icon"
                      />
                      <span>{item.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user-chip">
            <span className="sidebar-user-initials">DT</span>
            <div>
              <p className="sidebar-user-name">Dominik Tyrk</p>
              <p className="sidebar-user-role">Administrator</p>
            </div>
          </div>

          <button type="button" className="sidebar-signout" onClick={onLogout}>
            <LogOut size={18} strokeWidth={2} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
