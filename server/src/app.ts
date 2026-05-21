import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import logger from "morgan";
import { corsOptions } from "./config/cors";
import { indexRouter } from "./routes/index";
import { usersRouter } from "./routes/users";
import { errorHandler, notFoundHandler } from "./controllers/errors";

export const app = express();

/**
 * Global middlewares.
 */
app.use(cors(corsOptions));
app.use(logger("dev"));
app.use(express.json());
app.use(cookieParser());

/**
 * Endpoints.
 */
app.use("/", indexRouter);
app.use("/api/v1/users", usersRouter);

/**
 * Error handling.
 */
app.use(notFoundHandler);
app.use(errorHandler);
