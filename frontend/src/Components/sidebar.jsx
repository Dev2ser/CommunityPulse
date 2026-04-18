  import '../Styles/sidebar.css';
  import React from "react";
  import dashboardIcon from '../assets/dashboardIcon.svg';
  import surveysIcon from '../assets/surveysIcon.png';
  import exportsIcon from '../assets/exportsIcon.png';
  import adminIcon from '../assets/settingsIcon.png';
  import sidebarLogo from '../assets/tippingPointLogo.png';

  export default function Sidebar({ currentPage, isOpen, onClose, onNavigate }) {
    const menuItems = [
      { name: 'Dashboard', icon: dashboardIcon, page: 'dashboard' },
      { name: 'Surveys', icon: surveysIcon, page: 'adminSurveys' },
      {name: 'Results', icon: adminIcon, page: 'results'},
      { name: 'Exports', icon: exportsIcon, page: 'exports' },
      { name: 'Admin Settings', icon: adminIcon, page: 'settings' }
      
    ];

    function handleNavigation(page) {
      onNavigate(page);
    }

    return (
      <>
        <button
          type="button"
          className={`sidebar-backdrop ${isOpen ? "is-open" : ""}`}
          aria-label="Close navigation"
          onClick={onClose}
        />

        <aside className={`sidebar ${isOpen ? "is-open" : ""}`}>
          <div className="sidebar-logo-container">
            <button
              type="button"
              className="sidebar-close"
              onClick={onClose}
              aria-label="Close navigation"
            >
              ×
            </button>
            <img src={sidebarLogo} alt="Tipping Point Logo" className="sidebar-logo" />
            <div className="community-pulse">COMMUNITY PULSE</div>
            <div className="survey-platform">Survey Platform</div>
          </div>
          <div className="sidebar-horizontal-line"></div>
          <nav className="sidebar-nav" aria-label="Admin navigation">
            <ul>
              {menuItems.map((item) => (
                <li key={item.name}>
                  <button
                    type="button"
                    onClick={() => handleNavigation(item.page)}
                    className={`sidebar-item-button ${currentPage === item.page ? 'active' : ''}`}
                  >
                    <img src={item.icon} alt="" className="sidebar-icon" />
                    <span>{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </>
    );
  }
