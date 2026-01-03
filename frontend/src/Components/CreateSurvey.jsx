import React, { useState } from "react";
import "../Styles/CreateSurvey.css";

function CreateSurvey() {
  const [questions, setQuestions] = useState([]);
  const [title, setTitle] = useState("");
  const [targetNeighborhood, setTargetNeighborhood] = useState("");

  const addQuestion = (type) => {
    setQuestions([
      ...questions,
      { type, text: "", options: [], file: null },
    ]);
  };

  const updateQuestion = (index, updated) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...updated };
    setQuestions(newQuestions);
  };

  const handleSubmit = async () => {
    // 🔹 VALIDATION
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

    const hasValidQuestion = questions.some(
      (q) => q.text && q.text.trim().length > 0
    );

    if (!hasValidQuestion) {
      alert("At least one question must have text");
      return;
    }

    const surveyDataStructure = {
      title,
      description: "",
      targetNeighborhood: targetNeighborhood || "all",
      status: "draft",
      questions: questions.map((q) => ({
        text: q.text || "",
        type: q.type === "multiple" ? "multiple" : "text",
        allowImage: false,
        options:
          q.type === "multiple"
            ? q.options.filter((opt) => opt.trim().length > 0)
            : [],
      })),
    };

    try {
      const res = await fetch("http://localhost:5001/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(surveyDataStructure),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error creating survey");
        return;
      }

      alert("Survey created successfully!");

      // reset UI
      setTitle("");
      setTargetNeighborhood("");
      setQuestions([]);

    } catch (err) {
      console.error(err);
      alert("Server error creating survey");
    }
  };

  return (
    <div className="survey-page">
      <div className="survey-container">
        <h1 className="survey-title">Create New Survey</h1>

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
        />

        <div className="question-actions">
          <button onClick={() => addQuestion("text")}>Add Text Question</button>
          <button onClick={() => addQuestion("multiple")}>
            Add Multiple Choice
          </button>
          <button onClick={() => addQuestion("image")}>Add Image Upload</button>
          <button onClick={() => addQuestion("voice")}>
            Add Voice Recording
          </button>
        </div>

        <div className="questions-list">
          {questions.map((q, i) => (
            <div key={i} className="question-card">
              <h3>
                Question {i + 1} ({q.type})
              </h3>

              <input
                type="text"
                placeholder="Enter question text"
                value={q.text}
                onChange={(e) =>
                  updateQuestion(i, { text: e.target.value })
                }
              />

              {q.type === "multiple" && (
                <div className="options">
                  {q.options.map((opt, j) => (
                    <input
                      key={j}
                      type="text"
                      placeholder={`Option ${j + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...q.options];
                        newOpts[j] = e.target.value;
                        updateQuestion(i, { options: newOpts });
                      }}
                    />
                  ))}

                  <button
                    onClick={() =>
                      updateQuestion(i, { options: [...q.options, ""] })
                    }
                  >
                    + Add Option
                  </button>
                </div>
              )}

              {q.type === "image" && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    updateQuestion(i, { file: e.target.files[0] })
                  }
                />
              )}

              {q.type === "voice" && (
                <button
                  onClick={() =>
                    alert("Voice recording feature coming soon!")
                  }
                >
                  Record Voice
                </button>
              )}
            </div>
          ))}
        </div>

        <button className="submit-btn" onClick={handleSubmit}>
          Save Survey
        </button>
      </div>
    </div>
  );
}

export default CreateSurvey;
