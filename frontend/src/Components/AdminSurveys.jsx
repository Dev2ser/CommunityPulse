import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/AdminSurveys.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faPen,
  faCopy,
  faTrash,
  faBoxArchive,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";

export default function AdminSurveys() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [surveys, setSurveys] = useState([]);
  const [surveyToDelete, setSurveyToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const API_BASE =
    import.meta?.env?.VITE_API_URL || "http://localhost:5001/api";

  // Fetch surveys from backend
  useEffect(() => {
    const fetchSurveys = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/surveys`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to load surveys");
        }
        const data = await res.json();
        setSurveys(data.surveys || []);
      } catch (err) {
        setError(err.message || "Unable to fetch surveys");
      } finally {
        setLoading(false);
      }
    };

    fetchSurveys();
  }, [API_BASE]);

  //delete survey handler
  const handleDeleteSurvey = async () => {
    try {
      console.log(surveyToDelete);
      const res = await fetch(`${API_BASE}/surveys/${surveyToDelete._id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to delete survey");
      }

      // Remove from UI
      setSurveys((prev) => prev.filter((s) => s._id !== surveyToDelete._id));

      setSurveyToDelete(null);
    } catch (err) {
      console.error("Failed to delete survey:", err);
      alert(err.message);
    }
  };

  // Filtered and sorted surveys
  const filteredSurveys = useMemo(() => {
    return surveys
      .filter((survey) => {
        const titleMatch = survey.surveyTitle
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesFilter =
          filter === "All" ||
          survey.status?.toLowerCase() === filter.toLowerCase();
        return titleMatch && matchesFilter;
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [surveys, searchTerm, filter]);

  // Format dates
  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString();
  };

  const handleArchiveSurvey = async (survey) => {
    try {
      console.log("Archiving survey:", survey);

      const res = await fetch(`${API_BASE}/surveys/${survey._id}/archive`, {
        method: "POST",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to archive survey");
      }

      // Update local state after successful archive
      setSurveys((prev) =>
        prev.map((s) =>
          s._id === survey._id ? { ...s, status: "archived" } : s,
        ),
      );
    } catch (err) {
      console.error("Failed to archive survey:", err);
    }
  };

  const handlePublishSurvey = async (survey) => {
    try {
      console.log("Publishing survey:", survey);

      const res = await fetch(`${API_BASE}/surveys/${survey._id}/publish`, {
        method: "POST",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to publish survey");
      }

      // Update local state after successful publish
      setSurveys((prev) =>
        prev.map((s) =>
          s._id === survey._id ? { ...s, status: "published" } : s,
        ),
      );
    } catch (err) {
      console.error("Failed to publish survey:", err);
    }
  };

  return (
    <div className="admin-surveys">
      <div className="header">
        <h2>Survey Management</h2>
        <button
          className="create-button"
          onClick={() => navigate("/createsurvey")}
        >
          + Create New Survey
        </button>
      </div>

      <div className="controls">
        <input
          type="text"
          placeholder="Search surveys..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {loading && <p>Loading surveys...</p>}
      {error && <p className="error">{error}</p>}

      <table className="survey-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Created</th>
            <th>Responses</th>
            <th>Last Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredSurveys.map((survey) => (
            <tr key={survey._id}>
              <td>{survey.surveyTitle || survey.name}</td>
              <td className={`status ${survey.status.toLowerCase()}`}>
                {survey.status}
              </td>
              <td>{formatDate(survey.createdAt || survey.created)}</td>
              <td>{survey.responses}</td>
              <td>{formatDate(survey.updatedAt || survey.updated)}</td>
              <td>
                {/* View */}
                <button className="icon-button view" title="View Survey">
                  <FontAwesomeIcon icon={faEye} />
                </button>

                {/* Edit */}
                <button
                  className="icon-button edit"
                  title="Edit Survey"
                  onClick={() =>
                    navigate("/createsurvey", {
                      state: { mode: "edit", survey },
                    })
                  }
                >
                  <FontAwesomeIcon icon={faPen} />
                </button>

                {/* Copy */}
                <button className="icon-button copy" title="Copy Survey">
                  <FontAwesomeIcon icon={faCopy} />
                </button>

                {/* Delete */}
                <button
                  className="icon-button delete"
                  title="Delete Survey"
                  onClick={() => setSurveyToDelete(survey)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>

                {/* Conditional Publish / Archive */}
                {survey.status.toLowerCase() === "published" && (
                  <button
                    className="icon-button archive"
                    title="Archive Survey"
                    onClick={() => handleArchiveSurvey(survey)}
                  >
                    <FontAwesomeIcon icon={faBoxArchive} />
                  </button>
                )}

                {["draft", "archived"].includes(
                  survey.status.toLowerCase(),
                ) && (
                  <button
                    className="icon-button publish"
                    title="Publish Survey"
                    onClick={() => handlePublishSurvey(survey)}
                  >
                    <FontAwesomeIcon icon={faUpload} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {surveyToDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete Survey</h3>
            <p>
              Are you sure you want to delete{" "}
              <strong>
                {surveyToDelete.title || surveyToDelete.surveyTitle}
              </strong>
              ?
            </p>

            <div className="modal-actions">
              <button
                className="btn cancel"
                onClick={() => setSurveyToDelete(null)}
              >
                Cancel
              </button>
              <button className="btn danger" onClick={handleDeleteSurvey}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
