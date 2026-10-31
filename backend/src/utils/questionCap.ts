import {
  QuestionCategory,
  RequirementImportance,
} from "../../generated/prisma/enums.js";

const TOTAL_BUDGET = 30;

function getQuestionCount(
  importance: RequirementImportance,
  category: QuestionCategory,
): number {
  if (
    category === QuestionCategory.BEHAVIORAL ||
    category === QuestionCategory.ROLE_SPECIFIC
  ) {
    return importance === RequirementImportance.HIGH ? 2 : 1;
  }

  switch (importance) {
    case RequirementImportance.HIGH:
      return 4;
    case RequirementImportance.MEDIUM:
      return 2;
    case RequirementImportance.LOW:
      return 1;
  }
}

interface RequirementInput {
  importance: RequirementImportance;
  category: QuestionCategory;
}

export function calculateBudget(
  requirements: RequirementInput[],
): Map<string, number> {
  // Step 1: Assign ideal count per requirement
  const idealCounts = requirements.map((req) => ({
    key: `${req.importance}_${req.category}`,
    count: getQuestionCount(req.importance, req.category),
  }));

  const totalIdeal = idealCounts.reduce((sum, r) => sum + r.count, 0);

  
  if (totalIdeal <= TOTAL_BUDGET) {
    const result = new Map<string, number>();
    for (const { key, count } of idealCounts) {
      result.set(key, count);
    }
    return result;
  }

  const scale = TOTAL_BUDGET / totalIdeal;
  const result = new Map<string, number>();

  for (const { key, count } of idealCounts) {
    result.set(key, Math.max(1, Math.round(count * scale)));
  }

  return result;
}