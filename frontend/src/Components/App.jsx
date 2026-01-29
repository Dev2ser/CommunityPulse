import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ResidentApp from "./ResidentApp";
import AdminApp from "./AdminApp";

function MainApp() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admindashboard" element={<AdminApp />} />
        <Route path="/adminsurveys" element={<AdminApp />} />
        <Route path="/adminsettings" element={<AdminApp />} />
        <Route path="/createsurvey" element={<AdminApp />} />
        <Route path="/results" element={<AdminApp />} />
        <Route path="/exports" element={<AdminApp />} />
        <Route path="/adminlogin" element={<AdminApp />} />

        {/* Resident Routes - must be last to catch all */}
        <Route path="/*" element={<ResidentApp />} />
      </Routes>
    </Router>
  );
}

export default MainApp;
