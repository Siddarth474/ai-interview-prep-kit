import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { InterviewKitHandler } from "./interviewkit.controller.js";

const kitRouter = Router();

kitRouter.use(authenticate);

kitRouter.post("/", InterviewKitHandler.createKitHandler);
kitRouter.get("/", InterviewKitHandler.getUserKitsHandler);
kitRouter.get("/:kitId", InterviewKitHandler.getKitByIdHandler);

export { kitRouter };
