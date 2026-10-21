import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { flashcardHandler } from "./flashcard.controller.js";

const flashcardRouter = Router({ mergeParams: true });

flashcardRouter.use(authenticate);

flashcardRouter
  .post("/", flashcardHandler.createFlashcardHandler)
  .patch("/:flashcardId", flashcardHandler.updateFlashcardHandler)
  .delete("/:flashcardId", flashcardHandler.deleteFlashcardHandler);

export { flashcardRouter };
