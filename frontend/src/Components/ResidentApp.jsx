import { Routes, Route, useNavigate } from "react-router-dom";
import WelcomePage from "./WelcomePage";
import AvailableSurvey from "./AvailableSurveys"; 
import SurveyChat from "./SurveyChat";
import SurveyComplete from "./SurveyCompletePage";
function WelcomeWrapper() {
  const navigate = useNavigate();
  return <WelcomePage onStart={() => navigate("/surveys")} />;
}

function ResidentApp() {
  return (
    <Routes>
      <Route path="/" element={<WelcomeWrapper />} />
      <Route path="/surveys" element={<AvailableSurvey />} />
      <Route path="/survey-chat" element={<SurveyChat />} />
      <Route path="/transcript" element={<SurveyComplete />} />
    </Routes>
  );
}

export default ResidentApp;
