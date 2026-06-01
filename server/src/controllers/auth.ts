import {
  accessTokenMaxAge,
  errorCodes,
  refreshTokenMaxAge,
} from "@chat-app/shared/variables";
import { User } from "@chat-app/shared/validation";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import * as usersService from "../services/users";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const validationResult = User.login.request.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      error: {
        code: errorCodes.VALIDATION_ERROR,
        message: "Dados inválidos",
        details: validationResult.error.issues,
      },
    });
  }

  const { username, password } = req.body;

  const user = await usersService.getWithCredentials({
    username: username,
    plainTextPassword: password,
  });

  if (!user) {
    return res.status(401).json({
      error: {
        code: errorCodes.AUTH_ERROR,
        message: "Credenciais inválidas",
      },
    });
  }

  const accessToken = jwt.sign({ sub: user.id }, env.jwtSecret, {
    expiresIn: accessTokenMaxAge,
  });

  const refreshToken = jwt.sign({ sub: user.id }, env.jwtSecret, {
    expiresIn: refreshTokenMaxAge,
  });

  res
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: refreshTokenMaxAge,
      path: "/",
      sameSite: "none",
      secure: true,
    })
    .json({
      auth: {
        accessToken,
      },
    });
};

export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({
      error: {
        code: errorCodes.AUTH_ERROR,
        message: "You need a refresh token to access this resource",
      },
    });
  }

  try {
    const { sub } = jwt.verify(refreshToken, env.jwtSecret) as jwt.JwtPayload;

    if (!sub) throw new Error("sub not present in payload");

    const parsedSub = parseInt(sub, 10);

    if (isNaN(parsedSub)) throw new Error("sub must be a number");

    const accessToken = jwt.sign({ sub }, env.jwtSecret, {
      expiresIn: accessTokenMaxAge,
    });

    return res.json({
      auth: {
        accessToken,
      },
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: {
          code: errorCodes.AUTH_ERROR,
          message: "Invalid refresh token",
        },
      });
    }

    return next(error);
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const validationResult = User.register.request.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      error: {
        code: errorCodes.VALIDATION_ERROR,
        message: "Dados inválidos",
        details: validationResult.error.issues,
      },
    });
  }

  const { username, password } = req.body;

  const usernameTaken = Boolean(await usersService.findByUsername(username));

  if (usernameTaken) {
    return res.status(409).json({
      error: {
        code: errorCodes.USERNAME_TAKEN,
        message: `O nome de usuário "${username}" já está em uso`,
      },
    });
  }

  const newUser = await usersService.create({
    username: username,
    plainTextPassword: password,
  });

  res.status(201).json({ user: newUser });
};
