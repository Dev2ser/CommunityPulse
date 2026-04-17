import { useEffect, useMemo, useState } from "react";
import "../Styles/CreateSurvey.css";
import {
  CSV_SAMPLE,
  JSON_SAMPLE,
  QUESTION_TYPE_OPTIONS,
  createEmptyQuestion,
  createQuestionId,
  parseImportedQuestions,
  sanitizeQuestionForSave,
  supportsOptions,
  toQuestionDraft,
  validateQuestionDraft,
} from "../utils/surveyQuestionImport";

function CreateSurvey({ mode, surveyToEdit, onSaved, setPage }) {
  const API_BASE =
    import.meta?.env?.VITE_API_URL || "http://localhost:5001/api";

  const [surveyTitle, setSurveyTitle] = useState("");
  const [surveyDescription, setSurveyDescription] = useState("");
  const [targetNeighborhood, setTargetNeighborhood] = useState("all");
  const [status, setStatus] = useState("draft");
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [questionErrors, setQuestionErrors] = useState({});
  const [existingTitles, setExistingTitles] = useState([]);

  const [questionMode, setQuestionMode] = useState("manual");
  const [importPreview, setImportPreview] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [importFileName, setImportFileName] = useState("");
  const [importFeedback, setImportFeedback] = useState({
    type: "",
    message: "",
  });

  const isEditMode = mode === "edit";
  const editSurvey = surveyToEdit;

  useEffect(() => {
    const fetchUsedSurveyTitles = async () => {
      try {
        const response = await fetch(`${API_BASE}/surveys`);
        const data = await response.json();
        const titles = (data.surveys || []).map((survey) =>
          String(survey.surveyTitle || survey.title || "").trim().toLowerCase()
        );
        setExistingTitles(titles);
      } catch (err) {
        console.error("Error fetching surveys:", err);
      }
    };

    fetchUsedSurveyTitles();
  }, [API_BASE]);

  useEffect(() => {
    if (!isEditMode || !editSurvey) return;

    setSurveyTitle(editSurvey.surveyTitle || editSurvey.title || "");
    setSurveyDescription(editSurvey.description || "");
    setTargetNeighborhood(editSurvey.targetNeighborhood || "all");
    setStatus(editSurvey.status || "draft");
    setQuestions((editSurvey.questions || []).map((question) => toQuestionDraft(question)));
  }, [editSurvey, isEditMode]);

  const normalizedTitle = surveyTitle.trim().toLowerCase();
  const isDuplicate =
    normalizedTitle.length > 0 &&
    existingTitles.includes(normalizedTitle) &&
    (!isEditMode ||
      normalizedTitle !==
        String(editSurvey?.surveyTitle || editSurvey?.title || "")
          .trim()
          .toLowerCase());

  const importSummary = useMemo(() => {
    if (!importFileName) return "";

    const validCount = importPreview.length;
    const invalidCount = importErrors.length;

    if (validCount && invalidCount) {
      return `${validCount} questions ready to import, ${invalidCount} rows need attention.`;
    }

    if (validCount) {
      return `Imported file parsed successfully. ${validCount} questions ready to import.`;
    }

    if (invalidCount) {
      return `No valid questions found in ${importFileName}.`;
    }

    return "";
  }, [importErrors.length, importFileName, importPreview.length]);

  const resetImportState = () => {
    setImportPreview([]);
    setImportErrors([]);
    setImportFileName("");
    setImportFeedback({ type: "", message: "" });
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, createEmptyQuestion()]);
  };

  const updateQuestion = (id, updates) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === id ? { ...question, ...updates } : question
      )
    );
    setQuestionErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const updateQuestionType = (id, questionType) => {
    setQuestions((prev) =>
      prev.map((question) => {
        if (question.id !== id) return question;

        const shouldHaveOptions = supportsOptions(questionType);
        const existingOptions = shouldHaveOptions
          ? question.options && question.options.length > 0
            ? question.options
            : [""]
          : [];

        return {
          ...question,
          questionType,
          options: existingOptions,
        };
      })
    );
    setQuestionErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const deleteQuestion = (id) => {
    setQuestions((prev) => prev.filter((question) => question.id !== id));
    setQuestionErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const addOption = (id) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === id
          ? { ...question, options: [...(question.options || []), ""] }
          : question
      )
    );
  };

  const updateOption = (id, optionIndex, value) => {
    setQuestions((prev) =>
      prev.map((question) => {
        if (question.id !== id) return question;
        const nextOptions = [...(question.options || [])];
        nextOptions[optionIndex] = value;
        return { ...question, options: nextOptions };
      })
    );
  };

  const removeOption = (id, optionIndex) => {
    setQuestions((prev) =>
      prev.map((question) => {
        if (question.id !== id) return question;
        const nextOptions = (question.options || []).filter(
          (_, index) => index !== optionIndex
        );
        return { ...question, options: nextOptions };
      })
    );
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setImportFeedback({ type: "", message: "" });
    setImportFileName(file.name);

    try {
      const parsed = await parseImportedQuestions(file);
      setImportPreview(parsed.validQuestions);
      setImportErrors(parsed.rowErrors);

      if (!parsed.validQuestions.length && !parsed.rowErrors.length) {
        setImportFeedback({
          type: "error",
          message: "No questions were found in the uploaded file.",
        });
        return;
      }

      setImportFeedback({
        type: parsed.rowErrors.length > 0 ? "warning" : "success",
        message:
          parsed.validQuestions.length > 0
            ? `Parsed ${parsed.validQuestions.length} valid questions from ${file.name}.`
            : `Could not parse any valid questions from ${file.name}.`,
      });
    } catch (err) {
      console.error("Import error:", err);
      setImportPreview([]);
      setImportErrors([
        {
          location: file.name,
          message: err.message || "Unable to parse the uploaded file.",
        },
      ]);
      setImportFeedback({
        type: "error",
        message: err.message || "Unable to parse the uploaded file.",
      });
    }
  };

  const handleConfirmImport = () => {
    if (!importPreview.length) {
      setImportFeedback({
        type: "error",
        message: "There are no valid questions to import yet.",
      });
      return;
    }

    setQuestions((prev) => [
      ...prev,
      ...importPreview.map((question) => ({
        ...question,
        id: createQuestionId(),
      })),
    ]);

    setImportFeedback({
      type: "success",
      message: `Imported ${importPreview.length} questions successfully.`,
    });
    setQuestionMode("manual");
    setImportPreview([]);
    setImportErrors([]);
    setImportFileName("");
  };

  const handleDownloadSample = (format) => {
    const content = format === "csv" ? CSV_SAMPLE : JSON_SAMPLE;
    const blob = new Blob([content], {
      type:
        format === "csv"
          ? "text/csv;charset=utf-8"
          : "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `community-pulse-sample.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySample = async (format) => {
    const content = format === "csv" ? CSV_SAMPLE : JSON_SAMPLE;

    try {
      await navigator.clipboard.writeText(content);
      setImportFeedback({
        type: "success",
        message: `${format.toUpperCase()} sample copied to clipboard.`,
      });
    } catch (err) {
      console.error("Copy sample failed:", err);
      setImportFeedback({
        type: "error",
        message: "Unable to copy sample content in this browser.",
      });
    }
  };

  const handleCancel = () => {
    if (setPage) {
      setPage("adminSurveys");
    }
  };

  const submitSurvey = async () => {
    setSaveError("");
    setSaveSuccess("");

    if (isDuplicate) {
      setSaveError("Survey title already exists.");
      return;
    }

    if (!surveyTitle.trim()) {
      setSaveError("Survey title is required.");
      return;
    }

    if (!questions.length) {
      setSaveError("Add at least one question.");
      return;
    }

    const nextQuestionErrors = {};
    questions.forEach((question) => {
      const errors = validateQuestionDraft(question);
      if (errors.length > 0) {
        nextQuestionErrors[question.id] = errors;
      }
    });

    if (Object.keys(nextQuestionErrors).length > 0) {
      setQuestionErrors(nextQuestionErrors);
      setSaveError("Fix the highlighted questions before saving.");
      return;
    }

    const normalizedQuestions = questions.map(sanitizeQuestionForSave);
    const payload = {
      title: surveyTitle.trim(),
      surveyTitle: surveyTitle.trim(),
      description: surveyDescription.trim(),
      targetNeighborhood,
      status,
      questions: normalizedQuestions,
    };

    setIsSaving(true);

    try {
      const res = await fetch(
        isEditMode
          ? `${API_BASE}/surveys/${editSurvey._id}`
          : `${API_BASE}/surveys`,
        {
          method: isEditMode ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to save survey");
      }

      setSaveSuccess(
        isEditMode ? "Survey updated successfully." : "Survey created successfully."
      );

      if (typeof onSaved === "function") {
        window.setTimeout(() => onSaved(), 700);
      } else if (!isEditMode) {
        setSurveyTitle("");
        setSurveyDescription("");
        setTargetNeighborhood("all");
        setStatus("draft");
        setQuestions([]);
        setQuestionErrors({});
        resetImportState();
      }
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
          <h2>{isEditMode ? "Edit Survey" : "Create New Survey"}</h2>
          <p>
            {isEditMode
              ? "Update your survey details and questions"
              : "Design your community feedback survey"}
          </p>
        </div>
        <div className="create-survey-actions">
          <button className="btn btn-cancel" type="button" onClick={handleCancel}>
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
                  className={`text-input ${isDuplicate ? "error" : ""}`}
                  value={surveyTitle}
                  onChange={(e) => setSurveyTitle(e.target.value)}
                  placeholder="Community priorities survey"
                />
                {isDuplicate ? (
                  <span className="error-text">Survey title already exists.</span>
                ) : null}
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
                  <option value="all">All Communities</option>
                  <option value="riverside">Riverside Commons</option>
                  <option value="oakmont">Oakmont Heights</option>
                  <option value="parkside">Parkside Village</option>
                  <option value="downtown">Downtown Lofts</option>
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
              <div>
                <h3 className="questions-title">Questions</h3>
                <p className="questions-helper">
                  Build questions manually or import them from a CSV or JSON file.
                </p>
              </div>
              <span className="questions-count">{questions.length} questions</span>
            </div>

            <div className="question-mode-switch" role="tablist" aria-label="Question input modes">
              <button
                type="button"
                className={`mode-tab ${questionMode === "manual" ? "active" : ""}`}
                onClick={() => setQuestionMode("manual")}
              >
                Manual Entry
              </button>
              <button
                type="button"
                className={`mode-tab ${questionMode === "import" ? "active" : ""}`}
                onClick={() => setQuestionMode("import")}
              >
                Import File
              </button>
            </div>

            {questionMode === "import" ? (
              <div className="import-panel">
                <div className="import-uploader">
                  <div className="import-uploader-copy">
                    <h4>Upload survey questions</h4>
                    <p>
                      Supported file types: <strong>.csv</strong> and <strong>.json</strong>.
                      Imported questions populate the same question list and can be edited before saving.
                    </p>
                  </div>

                  <label className="btn btn-import-file">
                    Upload CSV or JSON
                    <input
                      type="file"
                      accept=".csv,.json,application/json,text/csv"
                      hidden
                      onChange={handleImportFile}
                    />
                  </label>
                </div>

                <div className="sample-grid">
                  <div className="sample-card">
                    <div className="sample-card-header">
                      <h5>CSV format</h5>
                      <div className="sample-actions">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => handleDownloadSample("csv")}
                        >
                          Download
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => handleCopySample("csv")}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <p className="sample-helper">
                      Columns: <code>questionText</code>, <code>questionType</code>,{" "}
                      <code>required</code>, <code>options</code>. Use <code>|</code> to
                      separate options.
                    </p>
                    <pre className="sample-code">{CSV_SAMPLE}</pre>
                  </div>

                  <div className="sample-card">
                    <div className="sample-card-header">
                      <h5>JSON format</h5>
                      <div className="sample-actions">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => handleDownloadSample("json")}
                        >
                          Download
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => handleCopySample("json")}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <p className="sample-helper">
                      Upload an array of question objects with <code>questionText</code>,{" "}
                      <code>questionType</code>, <code>required</code>, and optional{" "}
                      <code>options</code>.
                    </p>
                    <pre className="sample-code">{JSON_SAMPLE}</pre>
                  </div>
                </div>

                {importFeedback.message ? (
                  <div className={`import-feedback ${importFeedback.type}`}>
                    {importFeedback.message}
                  </div>
                ) : null}

                {importSummary ? (
                  <div className="import-summary">
                    <strong>{importFileName}</strong>
                    <span>{importSummary}</span>
                  </div>
                ) : null}

                {importPreview.length > 0 ? (
                  <div className="import-preview">
                    <div className="import-preview-header">
                      <h4>Preview imported questions</h4>
                      <button
                        type="button"
                        className="btn btn-publish"
                        onClick={handleConfirmImport}
                      >
                        Import {importPreview.length} Questions
                      </button>
                    </div>

                    <div className="import-preview-list">
                      {importPreview.map((question, index) => (
                        <div key={question.id} className="import-preview-item">
                          <div className="import-preview-meta">
                            <span>Question {index + 1}</span>
                            <span>{question.questionType}</span>
                            <span>{question.required ? "Required" : "Optional"}</span>
                          </div>
                          <p>{question.questionText}</p>
                          {supportsOptions(question.questionType) ? (
                            <div className="preview-options">
                              {question.options.map((option) => (
                                <span key={`${question.id}-${option}`} className="preview-option-chip">
                                  {option}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {importErrors.length > 0 ? (
                  <div className="import-errors">
                    <h4>Rows that need attention</h4>
                    <ul>
                      {importErrors.map((error, index) => (
                        <li key={`${error.location}-${index}`}>
                          <strong>{error.location}:</strong> {error.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="manual-builder">
                <div className="builder-toolbar">
                  <button
                    type="button"
                    className="btn btn-add-question"
                    onClick={addQuestion}
                    disabled={isSaving}
                  >
                    + Add Question
                  </button>
                </div>

                {questions.length === 0 ? (
                  <div className="empty-questions-state">
                    <h4>No questions yet</h4>
                    <p>
                      Start by adding a question manually or switch to Import File
                      to bring in a CSV or JSON template.
                    </p>
                  </div>
                ) : (
                  <div className="questions-list">
                    {questions.map((question, index) => (
                      <div key={question.id} className="question-item">
                        <div className="question-item-header">
                          <div className="question-title-row">
                            <span className="question-number">{index + 1}</span>
                            <div>
                              <h4>Question {index + 1}</h4>
                              <p>Define the prompt, type, requirement, and options.</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="btn btn-delete"
                            onClick={() => deleteQuestion(question.id)}
                          >
                            Remove
                          </button>
                        </div>

                        <div className="question-fields">
                          <div className="form-group">
                            <label>Question Text</label>
                            <input
                              className={`text-input ${
                                questionErrors[question.id] ? "error" : ""
                              }`}
                              placeholder="How long have you lived in this neighborhood?"
                              value={question.questionText}
                              onChange={(e) =>
                                updateQuestion(question.id, {
                                  questionText: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="question-controls">
                            <div className="control-group">
                              <label>Question Type</label>
                              <select
                                value={question.questionType}
                                onChange={(e) =>
                                  updateQuestionType(question.id, e.target.value)
                                }
                              >
                                {QUESTION_TYPE_OPTIONS.map((type) => (
                                  <option key={type.value} value={type.value}>
                                    {type.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="control-group">
                              <label>Required</label>
                              <label className="toggle">
                                <input
                                  type="checkbox"
                                  checked={question.required}
                                  onChange={(e) =>
                                    updateQuestion(question.id, {
                                      required: e.target.checked,
                                    })
                                  }
                                />
                                <span>
                                  {question.required ? "Required response" : "Optional question"}
                                </span>
                              </label>
                            </div>
                          </div>

                          {supportsOptions(question.questionType) ? (
                            <div className="options-container">
                              <div className="options-header">
                                <p className="options-label">Options</p>
                                <button
                                  type="button"
                                  className="btn btn-add-option"
                                  onClick={() => addOption(question.id)}
                                >
                                  + Add Option
                                </button>
                              </div>

                              {(question.options || []).length === 0 ? (
                                <p className="options-empty">
                                  Add at least one option for this question.
                                </p>
                              ) : null}

                              {(question.options || []).map((option, optionIndex) => (
                                <div
                                  key={`${question.id}-${optionIndex}`}
                                  className="option-row"
                                >
                                  <input
                                    className="text-input option-input"
                                    type="text"
                                    placeholder={`Option ${optionIndex + 1}`}
                                    value={option}
                                    onChange={(e) =>
                                      updateOption(
                                        question.id,
                                        optionIndex,
                                        e.target.value
                                      )
                                    }
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-delete option-delete"
                                    onClick={() => removeOption(question.id, optionIndex)}
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : null}

                          {questionErrors[question.id]?.length ? (
                            <ul className="question-error-list">
                              {questionErrors[question.id].map((error) => (
                                <li key={`${question.id}-${error}`}>{error}</li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {saveError ? <div className="error-banner">{saveError}</div> : null}
      {saveSuccess ? <div className="success-banner">{saveSuccess}</div> : null}
    </div>
  );
}

export default CreateSurvey;
