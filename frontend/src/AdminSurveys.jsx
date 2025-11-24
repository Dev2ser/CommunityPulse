import React from "react";
import "./AdminSurveys.css";

const AdminSurveys = () => {
  const surveys = [
    {
      title: "Neighborhood Growth Feedback",
      status: "Open",
      respondents: 124,
    },
    {
      title: "Community Event Planning",
      status: "Closed",
      respondents: 87,
    },
    {
      title: "Housing Development Survey",
      status: "Archived",
      respondents: 56,
    },
  ];

  return (
    <div>
      <header className="tp-header">
        <h1>Community Pulse</h1>
        <h2>Admin Survey Dashboard</h2>
      </header>

      <main className="tp-container">
        <div className="actions-bar">
          <button className="btn btn-green">+ Create New Survey</button>
        </div>

        <table className="tp-table">
          <thead>
            <tr>
              <th>Survey Title</th>
              <th>Status</th>
              <th>Respondents</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {surveys.map((survey, index) => (
              <tr key={index}>
                <td>{survey.title}</td>
                <td>
                  <span
                    className={`status ${survey.status.toLowerCase()}`}
                  >
                    {survey.status}
                  </span>
                </td>
                <td>{survey.respondents}</td>
                <td>
                  <button className="btn btn-blue">Open</button>
                  <button className="btn btn-navy">Close</button>
                  <button className="btn btn-grey">Archive</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default AdminSurveys;
