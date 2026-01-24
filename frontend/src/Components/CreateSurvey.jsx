import React, { useState, useEffect } from "react";
import "../Styles/CreateSurvey.css";

function CreateSurvey({ mode = "create", surveyToEdit = null, onSaved, onNavigate }) {
  const [questions, setQuestions] = useState([]);
  const [title, setTitle] = useState("");
  const [targetNeighborhood, setTargetNeighborhood] = useState("");

  // Prefill form when editing
  useEffect(() => {
    if (surveyToEdit) {
      setTitle(surveyToEdit.surveyTitle || "");
      setTargetNeighborhood(surveyToEdit.targetNeighborhood || "");
      setQuestions(
        surveyToEdit.questions?.map((q) => ({
          text: q.text,
          type: q.type,
          options: q.options || [],
          file: null,
        })) || []
      );
    }
  }, [surveyToEdit]);

  // Add a new question
  const addQuestion = (type) => {
    setQuestions([...questions, { type, text: "", options: [], file: null }]);
  };

  // Remove a question
  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  // Update an existing question
  const updateQuestion = (index, updated) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...updated };
    setQuestions(newQuestions);
  };

  // Remove an option from a multiple-choice question
  const removeOption = (qIndex, optIndex) => {
    const newOptions = questions[qIndex].options.filter((_, i) => i !== optIndex);
    updateQuestion(qIndex, { options: newOptions });
  };

  // Submit handler for create or update
  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Survey title is required");
      return;
    }

    if (!targetNeighborhood.trim()) {
      alert("Target neighborhood is required");
      return;
    }

    if (questions.length === 0) {
      alert("You must add at least one question");
      return;
    }

    const hasValidQuestion = questions.some((q) => q.text && q.text.trim().length > 0);
    if (!hasValidQuestion) {
      alert("At least one question must have text");
      return;
    }

    // Only send fields allowed to update
    const surveyData = {
      title,
      questions: questions.map((q) => ({
        text: q.text || "",
        type: q.type === "multiple" ? "multiple" : "text",
        allowImage: false,
        options: q.type === "multiple" ? q.options.filter(Boolean) : [],
      })),
    };

    try {
      const url =
        mode === "edit"
          ? `http://localhost:5001/api/surveys/${surveyToEdit._id}`
          : "http://localhost:5001/api/surveys";

      const method = mode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(surveyData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error saving survey");
        return;
      }

      alert(mode === "edit" ? "Survey updated successfully!" : "Survey created successfully!");

      // Reset form
      setTitle("");
      setTargetNeighborhood("");
      setQuestions([]);

      onSaved?.();
      onNavigate?.("adminSurveys");
    } catch (err) {
      console.error(err);
      alert("Server error saving survey");
    }
  };

  return (
    <div className="survey-page">
      <div className="survey-container">
        <h1 className="survey-title">
          {mode === "edit" ? "Update Survey" : "Create New Survey"}
        </h1>

        <input
          className="survey-input"
          type="text"
          placeholder="Survey Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="survey-input"
          type="text"
          placeholder="Target Neighborhood"
          value={targetNeighborhood}
          onChange={(e) => setTargetNeighborhood(e.target.value)}
          disabled={mode === "edit"} // optional: prevent changing on edit
        />

        <div className="question-actions">
          <button onClick={() => addQuestion("text")}>Add Text Question</button>
          <button onClick={() => addQuestion("multiple")}>Add Multiple Choice</button>
          <button onClick={() => addQuestion("image")}>Add Image Upload</button>
          <button onClick={() => addQuestion("voice")}>Add Voice Recording</button>
        </div>

        <div className="questions-list">
          {questions.map((q, i) => (
            <div key={i} className="question-card">
              <div className="question-header">
                <div>Question {i + 1} ({q.type})</div>
                <button className="delete-question-btn" onClick={() => removeQuestion(i)}>
                  Delete
                </button>
              </div>

              <input
                type="text"
                placeholder="Enter question text"
                value={q.text}
                onChange={(e) => updateQuestion(i, { text: e.target.value })}
              />

              {q.type === "multiple" && (
                <div className="options">
                  {q.options.map((opt, j) => (
                    <div key={j} className="option-row">
                      <input
                        type="text"
                        placeholder={`Option ${j + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...q.options];
                          newOpts[j] = e.target.value;
                          updateQuestion(i, { options: newOpts });
                        }}
                      />
                      <button
                        className="delete-option-btn"
                        onClick={() => removeOption(i, j)}
                      >
                        X
                      </button>
                    </div>
                  ))}
                  <button onClick={() => updateQuestion(i, { options: [...q.options, ""] })}>
                    + Add Option
                  </button>
                </div>
              )}

              {q.type === "image" && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => updateQuestion(i, { file: e.target.files[0] })}
                />
              )}

              {q.type === "voice" && (
                <button onClick={() => alert("Voice recording feature coming soon!")}>
                  Record Voice
                </button>
              )}
            </div>
          ))}
        </div>

        <button className="submit-btn" onClick={handleSubmit}>
          {mode === "edit" ? "Update Survey" : "Save Survey"}
        </button>
      </div>
    </div>
  );
}

export default CreateSurvey;
