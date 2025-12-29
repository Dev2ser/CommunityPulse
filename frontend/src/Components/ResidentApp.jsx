import { Routes, Route } from "react-router-dom";
import WelcomePage from "./WelcomePage";
import SurveyChat from "./SurveyChat";

function ResidentsApp() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/chat" element={<SurveyChat />} />
    </Routes>
  );
}

export default ResidentsApp;
