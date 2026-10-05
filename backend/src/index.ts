import express, { type Request, type Response } from "express";
import { authRouter } from "./modules/auth/auth.route.js";
import { kitRouter } from "./modules/interviewKit/interviewkit.route.js";
import { errorHandler } from "./middleware/errorHandler.js";
import "./worker/worker.js";

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("AI Interview Prep Kit Backend is running!");
});

app.use("/api/auth", authRouter);
app.use("/api/kits", kitRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
