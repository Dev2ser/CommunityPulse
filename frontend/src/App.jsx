import { useState } from "react";
import "./App.css";

import LoginPage from "./LoginPage";
import Sidebar from "./sidebar";
import Topbar from "./topbar";
import AdminSurveys from "./AdminSurveys";
import AdminSettings from "./AdminSettings";
import CreateSurvey from "./assets/CreateSurvey";

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
        <Topbar onNavigate={setPage} />

        {page === "dashboard" && <div>Dashboard content here</div>}
        {/* 👇 new line added here */}
        {page === "adminSurveys" && <AdminSurveys onNavigate={setPage} />}
        {page === "settings" && <AdminSettings />}
        {page === "createSurvey" && <CreateSurvey />}
      </div>
    </div>
  );
}

export default App;
