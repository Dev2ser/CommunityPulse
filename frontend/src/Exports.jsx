import React, { useState } from "react";
import "./Exports.css";

const mockReports = [
  {
    id: 1,
    title: "Student Satisfaction Survey",
    status: "In Progress",
    summary: "Analyzing feedback from 200 students on campus facilities.",
    date: "Nov 20, 2025",
    fullReport: "Full analysis and interpretation of student satisfaction survey results..."
  },
  {
    id: 2,
    title: "Community Engagement Survey",
    status: "Completed",
    summary: "Survey of 150 participants on local event participation.",
    date: "Nov 10, 2025",
    fullReport: "Detailed breakdown of engagement levels, demographics, and recommendations..."
  }
];

export default function Exports() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedReport(null);
    setShowModal(false);
  };

  const handleExport = (format, report) => {
    // Placeholder for export logic
    alert(`Exporting "${report.title}" as ${format.toUpperCase()}`);
  };

  return (
    <div className="exports-container">
      <h1>Survey Reports</h1>
      <div className="reports-list">
        {mockReports.map((report) => (
          <div key={report.id} className="report-card">
            <div className="report-header">
              <h2>{report.title}</h2>
              <span className={`status ${report.status.toLowerCase()}`}>
                {report.status}
              </span>
            </div>
            <p className="report-summary">{report.summary}</p>
            <p className="report-date">Date: {report.date}</p>
            <div className="report-actions">
              <button onClick={() => handleViewReport(report)}>View Report</button>
              <div className="dropdown">
                <button className="dropbtn">Export ▼</button>
                <div className="dropdown-content">
                  <span onClick={() => handleExport("pdf", report)}>Export as PDF</span>
                  <span onClick={() => handleExport("csv", report)}>Export as CSV</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && selectedReport && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedReport.title}</h2>
            <p>{selectedReport.fullReport}</p>
            <button onClick={handleCloseModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
