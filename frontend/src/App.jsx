import { useState } from "react";
import "./App.css";

import LoginPage from "./LoginPage";
import Sidebar from "./sidebar";
import Topbar from "./topbar";
import AdminSurveys from "./AdminSurveys";
import AdminSettings from "./AdminSettings";
import CreateSurvey from "./assets/CreateSurvey";
import Exports from "./Exports";
import Dashboard from "./Dashboard";
function App() {
  const [page, setPage] = useState("home");

  const handleLogin = () => setPage("dashboard");
  const handleBack = () => setPage("home");

  if (page === "login") {
    return <LoginPage onLogin={handleLogin} onBack={handleBack} />;
  }

  return (
    <div className="app-layout">
      <Sidebar onNavigate={setPage} />

      <div className="main-content">
        <Topbar currentPage={page} onNavigate={setPage} />

        {page === "dashboard" && <Dashboard />}
        {page === "adminSurveys" && <AdminSurveys onNavigate={setPage} />}
        {page === "settings" && <AdminSettings />}
        {page === "createSurvey" && <CreateSurvey />}
        {page === "exports" && <Exports />}
      </div>
    </div>
  );
}

export default App;
