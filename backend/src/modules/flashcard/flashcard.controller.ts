import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { flashcardService } from "./flashcard.service.js";
import {
  createFlashcardSchema,
  updateFlashcardSchema,
} from "./flashcard.schema.js";

export const flashcardHandler = {
  async createFlashcardHandler(
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

      const parseResult = createFlashcardSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res
          .status(400)
          .json(
            new ApiResponse(400, null, "Flashcard Creation Validation failed"),
          );
      }

      const flashcard = await flashcardService.createFlashcard(
        kitId,
        userId,
        parseResult.data,
      );

      return res
        .status(201)
        .json(new ApiResponse(201, flashcard, "Flashcard created successfully"));
    } catch (error) {
      next(error);
    }
  },

  async updateFlashcardHandler(
    req: Request<{ kitId: string; flashcardId: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError("Authentication required", 401, "NO_USER");
      }

      const { kitId, flashcardId } = req.params;

      const parseResult = updateFlashcardSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res
          .status(400)
          .json(
            new ApiResponse(400, null, "Flashcard Update Validation failed"),
          );
      }

      const flashcard = await flashcardService.updateFlashcard(
        kitId,
        flashcardId,
        userId,
        parseResult.data,
      );

      return res
        .status(200)
        .json(new ApiResponse(200, flashcard, "Flashcard updated successfully"));
    } catch (error) {
      next(error);
    }
  },

  async deleteFlashcardHandler(
    req: Request<{ kitId: string; flashcardId: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError("Authentication required", 401, "NO_USER");
      }

      const { kitId, flashcardId } = req.params;

      await flashcardService.deleteFlashcard(kitId, flashcardId, userId);

      return res
        .status(200)
        .json(new ApiResponse(200, null, "Flashcard deleted successfully"));
    } catch (error) {
      next(error);
    }
  },
};
