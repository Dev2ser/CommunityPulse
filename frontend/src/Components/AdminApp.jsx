import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../Styles/App.css";
import LoginPage from "./LoginPage";
import Sidebar from "./sidebar";
import Topbar from "./topbar";
import AdminSurveys from "./AdminSurveys";
import AdminSettings from "./AdminSettings";
import CreateSurvey from "./CreateSurvey";
import Exports from "./Exports";
import Dashboard from "./Dashboard";
import Results from "./Results";

function AdminApp() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isAuthed, setIsAuthed] = useState(() => {
    const stored = localStorage.getItem("authed");
    return stored === "true";
  });

  useEffect(() => localStorage.setItem("authed", isAuthed), [isAuthed]);

  // Check auth and redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthed && location.pathname !== "/adminlogin") {
      navigate("/adminlogin");
    }
  }, [isAuthed, location.pathname, navigate]);

  const handleLogin = () => {
    setIsAuthed(true);
    navigate("/admindashboard");
  };

  const handleLogout = () => {
    setIsAuthed(false);
    localStorage.removeItem("authed");
    navigate("/adminlogin");
  };

  if (!isAuthed) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Render the appropriate component based on current path
  const renderContent = () => {
    switch (location.pathname) {
      case "/admindashboard":
        return <Dashboard />;
      case "/adminsurveys":
        return <AdminSurveys />;
      case "/adminsettings":
        return <AdminSettings />;
      case "/createsurvey":
        return <CreateSurvey />;
      case "/results":
        return <Results />;
      case "/exports":
        return <Exports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar onLogout={handleLogout} />
        {renderContent()}
      </div>
    </div>
  );
}

export default AdminApp;
