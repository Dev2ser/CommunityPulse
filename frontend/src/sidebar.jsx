import './sidebar.css';
import dashboardIcon from './assets/dashboardIcon.png';
import surveysIcon from './assets/surveysIcon.png';
import resultsIcon from './assets/resultsIcon.png';
import exportsIcon from './assets/exportsIcon.png';
import adminIcon from './assets/settingsIcon.png';
import sidebarLogo from './assets/tippingPointLogo.png';

export default function Sidebar({ onNavigate }) {
  const menuItems = [
    { name: 'Dashboard', icon: dashboardIcon, page: 'dashboard' },
    { name: 'Surveys', icon: surveysIcon, page: 'adminSurveys' },
    { name: 'Results', icon: resultsIcon, page: 'results' },
    { name: 'Exports', icon: exportsIcon, page: 'exports' },
    { name: 'Admin Settings', icon: adminIcon, page: 'settings' },
  ];

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
            onClick={() => onNavigate(item.page)}
            className="sidebar-item"
          >
            <img src={item.icon} alt={`${item.name} icon`} className="sidebar-icon" />
            {item.name}
          </li>
        ))}
      </ul>
    </aside>
  );
}
