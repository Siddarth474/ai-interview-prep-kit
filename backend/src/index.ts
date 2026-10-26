import "dotenv/config";
import express, { type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { authRouter } from "./modules/auth/auth.route.js";
import { kitRouter } from "./modules/interviewKit/interviewkit.route.js";
import { questionRouter } from "./modules/question/question.route.js";
import { flashcardRouter } from "./modules/flashcard/flashcard.route.js";
import { studyScheduleRouter } from "./modules/studySchedule/studySchedule.route.js";
import { errorHandler } from "./middleware/errorHandler.js";
import "./worker/worker.js";

const app = express();
const PORT = process.env.PORT || 5001;

app.use(
  cors({
    origin: process.env.FRONTEND_URL!,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("AI Interview Prep Kit Backend is running!");
});

app.use("/api/auth", authRouter);
app.use("/api/kits", kitRouter);
app.use("/api/kits/:kitId/questions", questionRouter);
app.use("/api/kits/:kitId/flashcards", flashcardRouter);
app.use("/api/kits/:kitId/schedule", studyScheduleRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
