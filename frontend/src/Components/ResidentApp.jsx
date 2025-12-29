import { Routes, Route } from "react-router-dom";
import WelcomePage from "./WelcomePage";

function ResidentsApp() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
    </Routes>
  );
}

export default ResidentsApp;
