import { Router } from "express";
import { AuthHandler } from "./auth.controller.js";
import { authenticate } from "../../middleware/authenticate.js";

const authRouter = Router();

authRouter.post("/signup", AuthHandler.signupHandler);
authRouter.post("/login", AuthHandler.loginHandler);
authRouter.get("/me", authenticate, AuthHandler.getMeHandler);

export { authRouter }; 
