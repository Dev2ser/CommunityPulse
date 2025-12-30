import { Routes, Route, useNavigate } from "react-router-dom";
import WelcomePage from "./WelcomePage";

function ResidentApp() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
    </Routes>
  );
}

function WelcomeWrapper() {
  const navigate = useNavigate();
  return <WelcomePage onStart={() => navigate("/surveys")} />;
}

export default ResidentApp;
