import React, { useState } from "react";
import "./CreateSurvey.css";

function CreateSurvey() {
  const API_BASE = import.meta?.env?.VITE_API_URL || "http://localhost:5001/api";
  const [surveyTitle, setSurveyTitle] = useState("");
  const [surveyDescription, setSurveyDescription] = useState("");
  const [targetNeighborhood, setTargetNeighborhood] = useState("all");
  const [status, setStatus] = useState("draft");
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [questions, setQuestions] = useState([]);

  const addQuestion = (type = "text") => {
    const id = Date.now();
    const newQuestion = {
      id,
      type,
      text: "",
    };

    if (type === "text") {
      newQuestion.allowImage = false;
    }

    if (type === "multiple") {
      newQuestion.options = [""];
    }

    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id, updated) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updated } : q))
    );
  };

  const updateQuestionType = (id, type) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;

        return {
          ...q,
          type,
          options: type === "multiple" ? q.options || [""] : undefined,
          allowImage: type === "text" ? q.allowImage ?? false : undefined,
        };
      })
    );
  };

  const deleteQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const submitSurvey = async () => {
    setSaveError("");

    if (!surveyTitle.trim()) {
      setSaveError("Survey title is required.");
      return;
    }

    if (!questions.length) {
      setSaveError("Add at least one question.");
      return;
    }

    const payload = {
      title: surveyTitle.trim(),
      description: surveyDescription.trim(),
      targetNeighborhood,
      status,
      questions: questions.map((q) => ({
        text: q.text?.trim() || "",
        type: q.type,
        allowImage: q.type === "text" ? !!q.allowImage : false,
        options:
          q.type === "multiple"
            ? (q.options || []).filter((opt) => opt && opt.trim().length > 0)
            : [],
      })),
    };

    setIsSaving(true);

    try {
      const res = await fetch(`${API_BASE}/surveys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save survey");
      }

      const data = await res.json();
      alert("Survey saved!");
      console.log("Survey saved:", data);
    } catch (err) {
      console.error(err);
      setSaveError(err.message || "Unable to save survey");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="create-survey-container">
      <div className="create-survey-header">
        <div className="create-survey-header-text">
          <h2>Create New Survey</h2>
          <p>Design your community feedback survey</p>
        </div>
        <div className="create-survey-actions">
          <button className="btn btn-cancel" type="button">
            Cancel
          </button>
          <button
            className="btn btn-publish"
            type="button"
            onClick={submitSurvey}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="create-survey-layout">
        <div className="survey-details-panel">
          <div className="survey-details-card">
            <h3 className="survey-details-title">Survey Details</h3>

            <div className="survey-details-form">
              <div className="form-group">
                <label htmlFor="title">Survey Title</label>
                <input
                  id="title"
                  className="text-input"
                  placeholder="Enter survey title..."
                  value={surveyTitle}
                  onChange={(e) => setSurveyTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  className="text-area"
                  placeholder="Brief description of the survey purpose..."
                  value={surveyDescription}
                  onChange={(e) => setSurveyDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label htmlFor="neighborhood">Target Neighborhood</label>
                <select
                  id="neighborhood"
                  className="text-input"
                  value={targetNeighborhood}
                  onChange={(e) => setTargetNeighborhood(e.target.value)}
                >
                  <option value="">Select neighborhood</option>
                  <option value="riverside">Riverside Commons</option>
                  <option value="oakmont">Oakmont Heights</option>
                  <option value="parkside">Parkside Village</option>
                  <option value="downtown">Downtown Lofts</option>
                  <option value="all">All Communities</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  className="text-input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="questions-panel">
          <div className="questions-card">
            <div className="questions-header">
              <h3 className="questions-title">Questions</h3>
              <span className="questions-count">{questions.length} questions</span>
            </div>

            <div className="questions-list">
              {questions.map((q, index) => (
                <div key={q.id} className="question-item">
                  <div className="question-content">
                    <span className="question-number">{index + 1}</span>

                    <div className="question-fields">
                      <input
                        className="text-input"
                        placeholder="Question text..."
                        value={q.text}
                        onChange={(e) =>
                          updateQuestion(q.id, { text: e.target.value })
                        }
                      />

                      <div className="question-controls">
                        <div className="control-group">
                          <label>Type</label>
                          <select
                            value={q.type}
                            onChange={(e) =>
                              updateQuestionType(q.id, e.target.value)
                            }
                          >
                            <option value="text">Open Ended</option>
                            <option value="multiple">Multiple Choice</option>
                          </select>
                        </div>

                        {q.type === "text" && (
                          <label className="toggle">
                            <input
                              type="checkbox"
                              checked={q.allowImage || false}
                              onChange={(e) =>
                                updateQuestion(q.id, {
                                  allowImage: e.target.checked,
                                })
                              }
                            />
                            <span>Allow image attachments</span>
                          </label>
                        )}
                      </div>

                      {q.type === "multiple" && (
                        <div className="options-container">
                          <p className="options-label">Options:</p>
                          {(q.options || []).map((opt, j) => (
                            <input
                              key={`${q.id}-${j}`}
                              className="text-input option-input"
                              type="text"
                              placeholder={`Option ${j + 1}`}
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...(q.options || [])];
                                newOpts[j] = e.target.value;
                                updateQuestion(q.id, { options: newOpts });
                              }}
                            />
                          ))}
                          <button
                            type="button"
                            className="btn btn-add-option"
                            onClick={() =>
                              updateQuestion(q.id, {
                                options: [...(q.options || []), ""],
                              })
                            }
                          >
                            + Add Option
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="question-actions">
                      <button
                        type="button"
                        className="btn btn-delete"
                        onClick={() => deleteQuestion(q.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="add-question-row">
              <button
                type="button"
                className="btn btn-add-question"
                onClick={() => addQuestion("text")}
                disabled={isSaving}
              >
                + Add Question
              </button>
            </div>
          </div>
        </div>
      </div>

      {saveError && <div className="error-banner">{saveError}</div>}
    </div>
  );
}

export default CreateSurvey;
