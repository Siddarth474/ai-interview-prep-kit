import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { questionService } from "./question.service.js";
import {
  createQuestionSchema,
  questionCategoryParamSchema,
  reorderQuestionsSchema,
  updateQuestionSchema,
} from "./question.schema.js";

export const questionHandler = {
  async createQuestionHandler(
    req: Request<{ kitId: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError("Authentication required", 401, "NO_USER");
      }

      const { kitId } = req.params;

      const parseResult = createQuestionSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res
          .status(400)
          .json(
            new ApiResponse(400, null, "Question Creation Validation failed"),
          );
      }

      const question = await questionService.createQuestion(
        kitId,
        userId,
        parseResult.data,
      );

      return res
        .status(201)
        .json(new ApiResponse(201, question, "Question created successfully"));
    } catch (error) {
      next(error);
    }
  },

  async updateQuestionHandler(
    req: Request<{ kitId: string; questionId: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError("Authentication required", 401, "NO_USER");
      }

      const { kitId, questionId } = req.params;

      const parseResult = updateQuestionSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res
          .status(400)
          .json(
            new ApiResponse(400, null, "Question Update Validation failed"),
          );
      }

      const question = await questionService.updateQuestion(
        kitId,
        questionId,
        userId,
        parseResult.data,
      );

      return res
        .status(200)
        .json(new ApiResponse(200, question, "Question updated successfully"));
    } catch (error) {
      next(error);
    }
  },

  async deleteQuestionHandler(
    req: Request<{ kitId: string; questionId: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError("Authentication required", 401, "NO_USER");
      }

      const { kitId, questionId } = req.params;

      await questionService.deleteQuestion(kitId, questionId, userId);

      return res
        .status(200)
        .json(new ApiResponse(200, null, "Question deleted successfully"));
    } catch (error) {
      next(error);
    }
  },

  async reorderQuestionHandler(
    req: Request<{ kitId: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError("Authentication required", 401, "NO_USER");
      }

      const { kitId } = req.params;

      const parseResult = reorderQuestionsSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res
          .status(400)
          .json(
            new ApiResponse(400, null, "Question Reorder Validation failed"),
          );
      }

      const questions = await questionService.reorderQuestions(
        kitId,
        userId,
        parseResult.data,
      );

      return res
        .status(200)
        .json(new ApiResponse(200, questions, "Questions reordered successfully"));
    } catch (error) {
      next(error);
    }
  },

  async regenerateCategoryHandler(
    req: Request<{ kitId: string; category: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError("Authentication required", 401, "NO_USER");
      }

      const { kitId, category } = req.params;

      const normalizedCategory = category?.toUpperCase();
      const parseResult = questionCategoryParamSchema.safeParse(normalizedCategory);

      if (!parseResult.success) {
        return res
          .status(400)
          .json(
            new ApiResponse(400, null, "Invalid question category"),
          );
      }

      const questions = await questionService.regenerateCategory(
        kitId,
        userId,
        parseResult.data,
      );

      return res
        .status(200)
        .json(new ApiResponse(200, questions, "Questions regenerated successfully"));
    } catch (error) {
      next(error);
    }
  },
};
