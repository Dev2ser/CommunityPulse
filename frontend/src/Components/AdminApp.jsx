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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [pageProps, setPageProps] = useState({}); // <-- store props for navigation

  const [isAuthed, setIsAuthed] = useState(() => {
    const stored = localStorage.getItem("authed");
    return stored === "true";
  });

  useEffect(() => localStorage.setItem("currentpage", page), [page]);
  useEffect(() => localStorage.setItem("authed", isAuthed), [isAuthed]);
  useEffect(() => {
    if (!isSidebarOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isSidebarOpen]);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogin = () => {
    setIsAuthed(true);
    setPage("dashboard");
  };

  const handleLogout = () => {
    setIsAuthed(false);
    setPage("login");
    setIsSidebarOpen(false);
  };

  const handleNavigate = (nextPage, props = {}) => {
    if (!isAuthed) return setPage("login");
    setPage(nextPage);
    console.log("THE PAGE IS " + page);
    setPageProps(props); // <-- store extra props
    setIsSidebarOpen(false);
  };

  if (!isAuthed) return <LoginPage onLogin={handleLogin} />;

  return (
    <div className="app-layout">
      <Sidebar
        currentPage={page}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <div className="main-content">
        <Topbar
          currentPage={page}
          pageMode={pageProps.mode}
          onMenuToggle={() => setIsSidebarOpen((open) => !open)}
        />

        <div className="admin-page-area">
          <div className="admin-page-shell">
            {page === "dashboard" && <Dashboard />}
            {page === "adminSurveys" && (
              <AdminSurveys onNavigate={handleNavigate} />
            )}
            {page === "settings" && <AdminSettings />}
            {page === "createSurvey" && (
              <CreateSurvey
                onNavigate={handleNavigate}
                mode={pageProps.mode || "create"}
                surveyToEdit={pageProps.survey || null}
                onSaved={() => setPage("adminSurveys")}
                currentPage={page}
                setPage={setPage}
              />
            )}
            {page === "results" && <Results onNavigate={handleNavigate} />}
            {page === "exports" && <Exports />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminApp;
