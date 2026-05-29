import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import logger from "morgan";
import { corsOptions } from "./config/cors";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./controllers/errors";
import { authRouter } from "./routes/auth";
import { indexRouter } from "./routes/index";
import { messagesRouter } from "./routes/messages";
import { usersRouter } from "./routes/users";

export const app = express();

/**
 * Global middlewares.
 */
app.use(cors(corsOptions));
app.use(logger("dev", { skip: () => Boolean(env.nodeEnv === "test") }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/**
 * Endpoints.
 */
app.use("/", indexRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/messages", messagesRouter);
app.use("/api/v1/users", usersRouter);
app.get("/ping", (_, res) => res.sendStatus(200));

/**
 * Error handling.
 */
app.use(notFoundHandler);
app.use(errorHandler);
