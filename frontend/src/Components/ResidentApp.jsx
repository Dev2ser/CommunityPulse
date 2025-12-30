import { Routes, Route, useNavigate } from "react-router-dom";
import WelcomePage from "./WelcomePage";
import AvailableSurveys from "./AvailableSurveys";

function ResidentApp() {
  return (
    <Routes>
      <Route path="/" element={<WelcomeWrapper />} />
      <Route path="/surveys" element={<AvailableSurveys />} />
    </Routes>
  );
}

function WelcomeWrapper() {
  const navigate = useNavigate();
  return <WelcomePage onStart={() => navigate("/surveys")} />;
}

export default ResidentApp;
