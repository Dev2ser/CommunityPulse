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
import Results from "./Results";
function AdminApp() {
  const [page, setPage] = useState(() => {
    const stored = localStorage.getItem("currentpage");
    return stored || "dashboard";
  });

  const [pageProps, setPageProps] = useState({}); // <-- store props for navigation

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

  const handleNavigate = (nextPage, props = {}) => {
    if (!isAuthed) return setPage("login");
    setPage(nextPage);
    console.log("THE PAGE IS " + page);
    setPageProps(props); // <-- store extra props
  };

  if (!isAuthed) return <LoginPage onLogin={handleLogin} />;

  return (
    <div className="app-layout">
      <Sidebar onNavigate={handleNavigate} />

      <div className="main-content">
        <Topbar
          currentPage={page}
          pageMode={pageProps.mode}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />

        {page === "dashboard" && <Dashboard />}
        {page === "adminSurveys" && <AdminSurveys onNavigate={handleNavigate} />}
        {page === "settings" && <AdminSettings />}
        {page === "createSurvey" && (
          <CreateSurvey
            onNavigate={handleNavigate}
            mode={pageProps.mode || "create"}
            surveyToEdit={pageProps.survey || null}
            onSaved={() => setPage("adminSurveys")}
            currentPage ={page}
          />
        )}
        {page === "results" && <Results onNavigate={handleNavigate}/>}
        {page === "exports" && <Exports />}
      </div>
    </div>
  );
}

export default AdminApp;
