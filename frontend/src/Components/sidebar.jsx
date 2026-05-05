import "../Styles/sidebar.css";
import React, { useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Download,
  Settings,
  LogOut,
} from "lucide-react";
import sidebarLogo from "../assets/TP_Stacked_BlackGreen.png";
import ProfileModal from "./ProfileModal";

export default function Sidebar({
  currentPage,
  isOpen,
  onClose,
  onNavigate,
  onLogout,
}) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const storedName = localStorage.getItem("username") || "Administrator";
  const storedRole = localStorage.getItem("userRole") || "Administrator";

  const getInitials = (name) => {
    const parts = String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 0) return "AD";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  };

  const userInitials = getInitials(storedName);

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, page: "dashboard" },
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
          <div className="sidebar-user-section">
            <div className="sidebar-user-chip">
              <span className="sidebar-user-initials">{userInitials}</span>
              <div>
                <p className="sidebar-user-name">{storedName}</p>
                <p className="sidebar-user-role">{storedRole}</p>
              </div>
            </div>
            <button
              type="button"
              className="sidebar-settings-button"
              onClick={() => setIsProfileModalOpen(true)}
              aria-label="Profile settings"
              title="Profile settings"
            >
              <Settings size={18} strokeWidth={2} />
            </button>
          </div>

          <button type="button" className="sidebar-signout" onClick={onLogout}>
            <LogOut size={18} strokeWidth={2} />
            <span>Sign Out</span>
          </button>

          <ProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
          />
        </div>
      </aside>
    </>
  );
}
