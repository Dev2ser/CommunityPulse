  import '../Styles/sidebar.css';
  import React from "react";
  import { useNavigate, useLocation } from "react-router-dom";
  import dashboardIcon from '../assets/dashboardIcon.svg';
  import surveysIcon from '../assets/surveysIcon.png';
  import exportsIcon from '../assets/exportsIcon.png';
  import adminIcon from '../assets/settingsIcon.png';
  import sidebarLogo from '../assets/tippingPointLogo.png';

  export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
      { name: 'Dashboard', icon: dashboardIcon, path: '/admindashboard' },
      { name: 'Surveys', icon: surveysIcon, path: '/adminsurveys' },
      { name: 'Results', icon: adminIcon, path: '/results' },
      { name: 'Exports', icon: exportsIcon, path: '/exports' },
      { name: 'Admin Settings', icon: adminIcon, path: '/adminsettings' }
    ];

    function handleNavigation(path) {
      navigate(path);
    }

    return (
      <aside className="sidebar">
        <div className="sidebar-logo-container">
          <img src={sidebarLogo} alt="Tipping Point Logo" className="sidebar-logo" />
          <div className="community-pulse">COMMUNITY PULSE</div>
          <div className="survey-platform">Survey Platform</div>
        </div>
        <div className="sidebar-horizontal-line"></div>
        <ul>
          {menuItems.map((item) => (
            <li
              key={item.name}
              onClick={() => handleNavigation(item.path)}
              className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <img src={item.icon} alt={`${item.name} icon`} className="sidebar-icon" />
              {item.name}
            </li>
          ))}
        </ul>
      </aside>
    );
  }
