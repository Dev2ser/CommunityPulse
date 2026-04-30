import React, { useEffect, useMemo, useState } from "react";
import "../Styles/AdminSurveys.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faTrash,
  faBoxArchive,
  faUpload,
  faCircleXmark,
  faCirclePlay,
} from "@fortawesome/free-solid-svg-icons";
import { API_BASE } from "../utils/api";
import { showToast } from "../utils/toast";

export default function AdminSurveys({ onNavigate }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [surveys, setSurveys] = useState([]);
  const [surveyToDelete, setSurveyToDelete] = useState(null);
  const [surveyToArchive, setSurveyToArchive] = useState(null);
  const [surveyResponseCount, setSurveyResponseCount] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  useEffect(() => {
    const fetchAllResponseCounts = async () => {
      try {
        const results = await Promise.all(
          surveys.map(async (survey) => {
            const res = await fetch(
              `${API_BASE}/survey/responseCount/${encodeURIComponent(
                survey.surveyTitle,
              )}`,
            );

            if (!res.ok) {
              throw new Error("Failed to fetch response count");
            }

            const data = await res.json();
            return {
              id: survey._id,
              count: data.totalResponses || 0,
            };
          }),
        );

        const countsMap = {};
        results.forEach(({ id, count }) => {
          countsMap[id] = count;
        });

        setSurveyResponseCount(countsMap);
      } catch (err) {
        console.error("Failed to fetch response counts:", err);
      }
    };

    if (surveys.length > 0) {
      fetchAllResponseCounts();
    }
  }, [API_BASE, surveys]);

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
      showToast(err.message || "Failed to delete survey", "error");
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

  const summaryCounts = useMemo(() => {
    return surveys.reduce(
      (acc, survey) => {
        const status = (survey.status || "draft").toLowerCase();
        if (status === "published") acc.published += 1;
        else if (status === "archived") acc.archived += 1;
        else if (status === "closed") acc.closed += 1;
        else acc.draft += 1;
        return acc;
      },
      { published: 0, archived: 0, draft: 0, closed: 0 },
    );
  }, [surveys]);

  // Format dates
  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString();
  };

  const handleArchiveSurvey = async () => {
    if (!surveyToArchive) return;
    try {
      console.log("Archiving survey:", surveyToArchive);

      const res = await fetch(`${API_BASE}/surveys/${surveyToArchive._id}/archive`, {
        method: "POST",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to archive survey");
      }

      // Update local state after successful archive
      setSurveys((prev) =>
        prev.map((s) =>
          s._id === surveyToArchive._id ? { ...s, status: "archived" } : s,
        ),
      );

      setSurveyToArchive(null);
      showToast("Survey archived successfully", "success");
    } catch (err) {
      console.error("Failed to archive survey:", err);
      showToast(err.message || "Failed to archive survey", "error");
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

  const handleCloseSurvey = async (survey) => {
    try {
      console.log("Closing survey:", survey);

      const res = await fetch(`${API_BASE}/surveys/${survey._id}/close`, {
        method: "POST",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to close survey");
      }

      // Update local state after successful close
      setSurveys((prev) =>
        prev.map((s) =>
          s._id === survey._id ? { ...s, status: "closed" } : s,
        ),
      );
    } catch (err) {
      console.error("Failed to close survey:", err);
      showToast(err.message || "Failed to close survey", "error");
    }
  };

  const handleOpenSurvey = async (survey) => {
    try {
      console.log("Opening survey:", survey);

      const res = await fetch(`${API_BASE}/surveys/${survey._id}/open`, {
        method: "POST",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to open survey");
      }

      // Update local state after successful open
      setSurveys((prev) =>
        prev.map((s) =>
          s._id === survey._id ? { ...s, status: "published" } : s,
        ),
      );
    } catch (err) {
      console.error("Failed to open survey:", err);
      showToast(err.message || "Failed to open survey", "error");
    }
  };

  return (
    <div className="admin-surveys">
      <div className="header">
        <div className="header-copy">
          <h2>Survey Management</h2>
          <p>Create, manage and monitor all community surveys</p>
        </div>

        <button
          className="create-button"
          onClick={() => onNavigate("createSurvey")}
        >
          <span className="create-plus">+</span> Create New Survey
        </button>
      </div>

      <div className="controls">
        <div className="controls-left">
          <input
            type="text"
            placeholder="Search surveys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="survey-count-label">
          {filteredSurveys.length} surveys found
        </div>
      </div>

      {loading && <p>Loading surveys...</p>}
      {error && <p className="error">{error}</p>}

      <div className="cards-wrapper survey-table-wrapper">
        <table className="survey-table">
          <thead>
            <tr>
              <th>SURVEY NAME</th>
              <th>STATUS</th>
              <th>CREATED</th>
              <th>RESPONSES</th>
              <th>LAST UPDATED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredSurveys.map((survey) => (
              <tr key={survey._id}>
                <td data-label="Survey Name">
                  {survey.surveyTitle || survey.name}
                </td>
                <td data-label="Status">
                  <span
                    className={`status-badge ${survey.status.toLowerCase()}`}
                  >
                    <span className="status-dot" />
                    {survey.status}
                  </span>
                </td>
                <td data-label="Created">
                  {formatDate(survey.createdAt || survey.created)}
                </td>
                <td data-label="Responses">
                  {surveyResponseCount[survey._id] ?? 0}
                </td>
                <td data-label="Last Updated">
                  {formatDate(survey.updatedAt || survey.updated)}
                </td>
                <td className="action-cell" data-label="Actions">
                  <button
                    className="icon-button edit"
                    title="Edit Survey"
                    onClick={() =>
                      onNavigate("createSurvey", { mode: "edit", survey })
                    }
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </button>

                  <button
                    className="icon-button delete"
                    title="Delete Survey"
                    onClick={() => setSurveyToDelete(survey)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>

                  {survey.status.toLowerCase() === "published" && (
                    <>
                      <button
                        className="icon-button close"
                        title="Close Survey"
                        onClick={() => handleCloseSurvey(survey)}
                      >
                        <FontAwesomeIcon icon={faCircleXmark} />
                      </button>
                      <button
                        className="icon-button archive"
                        title="Archive Survey"
                        onClick={() => setSurveyToArchive(survey)}
                      >
                        <FontAwesomeIcon icon={faBoxArchive} />
                      </button>
                    </>
                  )}

                  {survey.status.toLowerCase() === "closed" && (
                    <button
                      className="icon-button open"
                      title="Reopen Survey"
                      onClick={() => handleOpenSurvey(survey)}
                    >
                      <FontAwesomeIcon icon={faCirclePlay} />
                    </button>
                  )}

                  {survey.status.toLowerCase() === "draft" && (
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
      </div>

      <div className="survey-status-summary">
        <span className="summary-chip published">
          {summaryCounts.published} Published
        </span>
        <span className="summary-chip closed">
          {summaryCounts.closed} Closed
        </span>
        <span className="summary-chip archived">
          {summaryCounts.archived} Archived
        </span>
        <span className="summary-chip draft">{summaryCounts.draft} Draft</span>
      </div>

      {surveyToDelete && (
        <div className="survey-modal-overlay">
          <div className="survey-modal">
            <h3>Delete Survey</h3>
            <p>
              Are you sure you want to delete{" "}
              <strong>
                {surveyToDelete.title || surveyToDelete.surveyTitle}
              </strong>
              ?
            </p>

            <div className="survey-modal-actions">
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

      {surveyToArchive && (
        <div className="survey-modal-overlay">
          <div className="survey-modal">
            <h3>Archive Survey</h3>
            <p>
              Are you sure you want to archive{" "}
              <strong>
                {surveyToArchive.title || surveyToArchive.surveyTitle}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="survey-modal-actions">
              <button
                className="btn cancel"
                onClick={() => setSurveyToArchive(null)}
              >
                Cancel
              </button>
              <button className="btn danger" onClick={handleArchiveSurvey}>
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
