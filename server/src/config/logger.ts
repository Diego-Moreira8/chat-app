import logger from "morgan";
import { env } from "./env";
import { Request, Response } from "express";

export const loggerOptions: logger.Options<Request, Response> = {
  skip: () =>
    Boolean(
      env.nodeEnv === "test" ||
      env.nodeEnv === undefined /* Supertest keeps it undefined */,
    ),
};
