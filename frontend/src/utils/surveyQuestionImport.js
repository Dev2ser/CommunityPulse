import Papa from "papaparse";

export const QUESTION_TYPE_OPTIONS = [
  { value: "text", label: "Text" },
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "checkbox", label: "Checkboxes" },
  { value: "dropdown", label: "Dropdown" },
];

export const CSV_SAMPLE = `questionText,questionType,required,options
How long have you lived in this neighborhood?,text,true,
What is the biggest challenge facing your neighborhood right now?,multiple_choice,true,Safety|Housing|Traffic|Jobs|Other
Which improvements would you like to see?,checkbox,false,Parks|Lighting|Road repair|Affordable housing`;

export const JSON_SAMPLE = `[
  {
    "questionText": "How long have you lived in this neighborhood?",
    "questionType": "text",
    "required": true
  },
  {
    "questionText": "What is the biggest challenge facing your neighborhood right now?",
    "questionType": "multiple_choice",
    "required": true,
    "options": ["Safety", "Housing", "Traffic", "Jobs", "Other"]
  },
  {
    "questionText": "Which improvements would you like to see?",
    "questionType": "checkbox",
    "required": false,
    "options": ["Parks", "Lighting", "Road repair", "Affordable housing"]
  }
]`;

const LEGACY_TYPE_MAP = {
  multiple: "multiple_choice",
};

const OPTION_BASED_TYPES = new Set([
  "multiple_choice",
  "checkbox",
  "dropdown",
]);

const SUPPORTED_TYPES = new Set(QUESTION_TYPE_OPTIONS.map((type) => type.value));

export const createQuestionId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const supportsOptions = (questionType) =>
  OPTION_BASED_TYPES.has(normalizeQuestionType(questionType));

export const normalizeQuestionType = (value) => {
  const raw = String(value || "text").trim().toLowerCase();
  return LEGACY_TYPE_MAP[raw] || raw;
};

export const normalizeRequiredValue = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;

  const raw = String(value || "").trim().toLowerCase();
  if (["true", "yes", "y", "1"].includes(raw)) return true;
  if (["false", "no", "n", "0", ""].includes(raw)) return false;
  return false;
};

const sanitizeOptions = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((option) => String(option || "").trim())
      .filter(Boolean);
  }

  return String(value || "")
    .split("|")
    .map((option) => option.trim())
    .filter(Boolean);
};

export const toQuestionDraft = (question = {}) => {
  const questionType = normalizeQuestionType(
    question.questionType ?? question.type
  );

  return {
    id: question.id || createQuestionId(),
    questionText: String(question.questionText ?? question.text ?? ""),
    questionType: SUPPORTED_TYPES.has(questionType) ? questionType : questionType || "text",
    required: normalizeRequiredValue(question.required),
    options: supportsOptions(questionType)
      ? sanitizeOptions(question.options)
      : [],
  };
};

export const createEmptyQuestion = () => ({
  id: createQuestionId(),
  questionText: "",
  questionType: "text",
  required: false,
  options: [],
});

export const validateQuestionDraft = (question) => {
  const errors = [];
  const questionText = String(question.questionText || "").trim();
  const questionType = normalizeQuestionType(question.questionType);
  const options = sanitizeOptions(question.options);

  if (!questionText) {
    errors.push("Question text is required.");
  }

  if (!questionType) {
    errors.push("Question type is required.");
  } else if (!SUPPORTED_TYPES.has(questionType)) {
    errors.push(`Unsupported question type "${question.questionType}".`);
  }

  if (supportsOptions(questionType) && options.length === 0) {
    errors.push("At least one option is required for this question type.");
  }

  return errors;
};

export const sanitizeQuestionForSave = (question) => {
  const questionType = normalizeQuestionType(question.questionType);
  const options = supportsOptions(questionType)
    ? sanitizeOptions(question.options)
    : [];
  const questionText = String(question.questionText || "").trim();
  const required = normalizeRequiredValue(question.required);

  return {
    questionText,
    questionType,
    required,
    options,
  };
};

const parseCsvQuestions = (content) => {
  const parsed = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (parsed.errors.length) {
    return {
      rows: [],
      errors: parsed.errors.map((error) => ({
        location: `Row ${error.row ? error.row + 1 : "unknown"}`,
        message: error.message,
      })),
    };
  }

  return { rows: parsed.data, errors: [] };
};

const parseJsonQuestions = (content) => {
  const parsed = JSON.parse(content);

  if (!Array.isArray(parsed)) {
    throw new Error("JSON import must be an array of question objects.");
  }

  return { rows: parsed, errors: [] };
};

export const parseImportedQuestions = async (file) => {
  const fileName = file?.name || "";
  const extension = fileName.split(".").pop()?.toLowerCase();
  const content = await file.text();

  if (!["csv", "json"].includes(extension)) {
    throw new Error("Unsupported file type. Upload a CSV or JSON file.");
  }

  const parserResult =
    extension === "csv" ? parseCsvQuestions(content) : parseJsonQuestions(content);

  const validQuestions = [];
  const rowErrors = [...parserResult.errors];

  parserResult.rows.forEach((row, index) => {
    const location = extension === "csv" ? `Row ${index + 2}` : `Item ${index + 1}`;
    const draft = toQuestionDraft(row);
    const errors = validateQuestionDraft(draft);

    if (errors.length > 0) {
      rowErrors.push({
        location,
        message: errors.join(" "),
      });
      return;
    }

    validQuestions.push({
      ...draft,
      id: createQuestionId(),
      options: supportsOptions(draft.questionType)
        ? sanitizeOptions(draft.options)
        : [],
    });
  });

  return {
    validQuestions,
    rowErrors,
    extension,
  };
};
