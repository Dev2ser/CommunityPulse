import { useEffect, useState } from "react";
import "../Styles/App.css";
import LoginPage from "./LoginPage";
import Sidebar from "./sidebar";
import Topbar from "./topbar";
import AdminSurveys from "./AdminSurveys";
import AdminSettings from "./AdminSettings";
import CreateSurvey from "./CreateSurvey";
import Exports from "./Exports";
import Dashboard from "./Dashboard";

function AdminApp() {
  const [page, setPage] = useState(() => {
    const stored = localStorage.getItem("currentpage");
    return stored || "dashboard";
  });

  const [isAuthed, setIsAuthed] = useState(() => {
    const stored = localStorage.getItem("authed");
    return stored === "true";
  });

  useEffect(() => localStorage.setItem("currentpage", page), [page]);
  useEffect(() => localStorage.setItem("authed", isAuthed), [isAuthed]);

  const handleLogin = () => {
    setIsAuthed(true);
    setPage("dashboard");
  };

  const handleLogout = () => {
    setIsAuthed(false);
    setPage("login");
  };

  const handleNavigate = (nextPage) => {
    if (!isAuthed) return setPage("login");
    setPage(nextPage);
  };

  if (!isAuthed) return <LoginPage onLogin={handleLogin} />;

  return (
    <div className="app-layout">
      <Sidebar onNavigate={handleNavigate} />

      <div className="main-content">
        <Topbar
          currentPage={page}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />

        {page === "dashboard" && <Dashboard />}
        {page === "adminSurveys" && <AdminSurveys onNavigate={handleNavigate} />}
        {page === "settings" && <AdminSettings />}
        {page === "createSurvey" && <CreateSurvey />}
        {page === "exports" && <Exports />}
      </div>
    </div>
  );
}

export default AdminApp;
