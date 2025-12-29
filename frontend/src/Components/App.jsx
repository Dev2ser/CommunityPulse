import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ResidentApp from "./ResidentApp";
import AdminApp from "./AdminApp";

function MainApp() {
  return (
    <Router>
      <Routes>

        {/* Resident */}
        <Route path="/*" element={<ResidentApp />} />

        {/* Admin */}
        <Route path="/admin/*" element={<AdminApp />} />

      </Routes>
    </Router>
  );
}

export default MainApp;
