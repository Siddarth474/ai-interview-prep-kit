import {
  QuestionCategory,
  RequirementImportance,
} from "../../generated/prisma/enums.js";

const TOTAL_BUDGET = 30;

function getQuestionCount(
  importance: RequirementImportance,
  category: QuestionCategory,
): number {
  // Behavioral and role-specific don't need many questions — 2 max
  if (
    category === QuestionCategory.BEHAVIORAL ||
    category === QuestionCategory.ROLE_SPECIFIC
  ) {
    return importance === RequirementImportance.HIGH ? 2 : 1;
  }

  // Technical and system design benefit from more depth
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

/**
 * Calculates per-requirement question count based on importance + category,
 * then scales down proportionally if the total exceeds the budget cap.
 */
export function calculateBudget(
  requirements: RequirementInput[],
): Map<string, number> {
  // Step 1: Assign ideal count per requirement
  const idealCounts = requirements.map((req) => ({
    key: `${req.importance}_${req.category}`,
    count: getQuestionCount(req.importance, req.category),
  }));

  const totalIdeal = idealCounts.reduce((sum, r) => sum + r.count, 0);

  // Step 2: If within budget, use ideal counts directly
  if (totalIdeal <= TOTAL_BUDGET) {
    const result = new Map<string, number>();
    for (const { key, count } of idealCounts) {
      result.set(key, count);
    }
    return result;
  }

  // Step 3: Scale down proportionally, ensuring at least 1 per requirement
  const scale = TOTAL_BUDGET / totalIdeal;
  const result = new Map<string, number>();

  for (const { key, count } of idealCounts) {
    result.set(key, Math.max(1, Math.round(count * scale)));
  }

  return result;
}