import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import logger from "morgan";
import { corsOptions } from "./config/cors";
import { errorHandler, notFoundHandler } from "./controllers/errors";
import { indexRouter } from "./routes/index";
import { authRouter } from "./routes/auth";
import { env } from "./config/env";

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

/**
 * Error handling.
 */
app.use(notFoundHandler);
app.use(errorHandler);
