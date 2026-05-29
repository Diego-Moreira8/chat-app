import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";
import { errorCodes } from "../utils/error-codes";

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({
      error: errorCodes.AUTH_ERROR,
      message: "You need an access token to access this resource",
    });
  }

  if (!authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      error: errorCodes.AUTH_ERROR,
      message: "Wrong access token format",
    });
  }

  const accessToken = authorization.split(" ")[1];

  try {
    const { sub } = jwt.verify(accessToken, env.jwtSecret) as JwtPayload;

    if (!sub) throw new Error("sub not present in payload");

    const parsedSub = parseInt(sub, 10);

    if (isNaN(parsedSub)) throw new Error("sub must be a number");

    res.locals.sub = parsedSub;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: errorCodes.AUTH_ERROR,
        message: "Invalid access token",
      });
    }

    next(error);
  }
};
