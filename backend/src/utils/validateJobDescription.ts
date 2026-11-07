export interface JobDescriptionValidationResult {
  isValid: boolean;
  message?: string;
}

const HIRING_KEYWORDS = [
  "responsibilities",
  "responsibility",
  "requirements",
  "requirement",
  "qualifications",
  "qualification",
  "experience",
  "skills",
  "skill",
  "role",
  "team",
  "engineer",
  "engineering",
  "developer",
  "development",
  "design",
  "designer",
  "architect",
  "architecture",
  "manager",
  "management",
  "analyst",
  "candidate",
  "candidates",
  "technologies",
  "technology",
  "stack",
  "degree",
  "bachelor",
  "master",
  "build",
  "building",
  "deliver",
  "delivery",
  "collaborate",
  "collaboration",
  "proficient",
  "proficiency",
  "knowledge",
  "working",
  "position",
  "opportunity",
  "preferred",
  "duties",
  "hands-on",
  "full-time",
  "part-time",
  "internship",
  "intern",
];

export function validateJobDescriptionHeuristic(
  text: string,
): JobDescriptionValidationResult {
  const trimmed = text.trim();

  if (trimmed.length < 150) {
    return {
      isValid: false,
      message:
        "Job description is too brief. Please provide at least 150 characters describing role responsibilities and requirements.",
    };
  }

  if (trimmed.length > 40000) {
    return {
      isValid: false,
      message:
        "Job description exceeds maximum allowed length (40,000 characters).",
    };
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < 25) {
    return {
      isValid: false,
      message: "Job description must contain at least 25 words.",
    };
  }

  if (/([a-zA-Z0-9])\1{7,}/.test(trimmed)) {
    return {
      isValid: false,
      message: "Job description contains repetitive characters or gibberish.",
    };
  }

  const totalWordLength = words.reduce((acc, w) => acc + w.length, 0);
  const avgWordLength = totalWordLength / words.length;
  if (avgWordLength < 2.5 || avgWordLength > 20) {
    return {
      isValid: false,
      message:
        "Job description contains abnormal word structures or unspaced text.",
    };
  }

  const lower = trimmed.toLowerCase();
  let matchedCount = 0;

  for (const kw of HIRING_KEYWORDS) {
    if (lower.includes(kw)) {
      matchedCount++;
      if (matchedCount >= 2) break;
    }
  }

  if (matchedCount < 2) {
    return {
      isValid: false,
      message:
        "Input does not appear to be a job description. Please paste a valid role description with responsibilities or requirements.",
    };
  }

  return { isValid: true };
}
