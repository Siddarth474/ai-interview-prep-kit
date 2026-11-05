import type { ZodError } from "zod";

export interface FormattedZodError {
  message: string;
  errors: Record<string, string[] | undefined>;
}

export function formatZodError(
  error: ZodError,
  fallbackMessage = "Validation failed",
): FormattedZodError {
  const firstIssueMessage = error.issues[0]?.message;
  return {
    message: firstIssueMessage || fallbackMessage,
    errors: error.flatten().fieldErrors,
  };
}
