import { Router } from "express";
import { AuthHandler } from "./auth.controller.js";

const authRouter = Router();

authRouter.post("/signup", AuthHandler.signupHandler);
authRouter.post("/login", AuthHandler.loginHandler);

export { authRouter }; 
