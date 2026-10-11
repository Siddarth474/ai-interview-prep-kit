import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { questionHandler } from "./question.controller.js";

const questionRouter = Router({ mergeParams: true });

questionRouter.use(authenticate);

questionRouter
  .post("/", questionHandler.createQuestionHandler)
  .post("/regenerate/:category", questionHandler.regenerateCategoryHandler)
  .patch("/reorder", questionHandler.reorderQuestionHandler)
  .patch("/:questionId", questionHandler.updateQuestionHandler)
  .delete("/:questionId", questionHandler.deleteQuestionHandler);

export { questionRouter }; 
