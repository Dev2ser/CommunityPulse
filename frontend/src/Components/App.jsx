import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ResidentApp from "./ResidentApp";
import AdminApp from "./AdminApp";
import ToastHost from "./ToastHost";

function MainApp() {
  return (
    <Router>
      <ToastHost />
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
