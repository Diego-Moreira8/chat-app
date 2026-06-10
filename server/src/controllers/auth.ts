import {
  accessTokenMaxAge,
  LoginBody,
  refreshTokenMaxAge,
  UserRegisterBody,
  type AccessToken,
  type ErrorData,
  type UserData,
  type ValidationErrorData,
} from "@chat-app/shared";
import { CookieOptions, NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import * as usersService from "../services/users";

const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  path: "/",
  sameSite: "none",
  secure: true,
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const validationResult = LoginBody.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Dados inválidos",
        details: validationResult.error.issues,
      },
    } satisfies ValidationErrorData);
  }

  const { username, password } = validationResult.data;

  const user = await usersService.getWithCredentials({
    username: username,
    plainTextPassword: password,
  });

  if (!user) {
    return res.status(401).json({
      error: {
        code: "AUTH_ERROR",
        message: "Credenciais inválidas",
      },
    } satisfies ErrorData);
  }

  const accessToken = jwt.sign({ sub: user.id }, env.jwtSecret, {
    expiresIn: accessTokenMaxAge / 1000,
  });

  const refreshToken = jwt.sign({ sub: user.id }, env.jwtSecret, {
    expiresIn: refreshTokenMaxAge / 1000,
  });

  res
    .cookie("refreshToken", refreshToken, {
      ...refreshTokenCookieOptions,
      maxAge: refreshTokenMaxAge,
    })
    .json({
      accessToken,
    } satisfies AccessToken);
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.clearCookie("refreshToken", refreshTokenCookieOptions).sendStatus(204);
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
        code: "AUTH_ERROR",
        message: "You need a refresh token to access this resource",
      },
    } satisfies ErrorData);
  }

  try {
    const { sub } = jwt.verify(refreshToken, env.jwtSecret) as jwt.JwtPayload;

    if (!sub) throw new Error("sub not present in payload");

    const parsedSub = parseInt(sub, 10);

    if (isNaN(parsedSub)) throw new Error("sub must be a number");

    const accessToken = jwt.sign({ sub }, env.jwtSecret, {
      expiresIn: accessTokenMaxAge / 1000,
    });

    return res.json({
      accessToken,
    } satisfies AccessToken);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: {
          code: "AUTH_ERROR",
          message: "Invalid refresh token",
        },
      } satisfies ErrorData);
    }

    return next(error);
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const validationResult = UserRegisterBody.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Dados inválidos",
        details: validationResult.error.issues,
      },
    } satisfies ValidationErrorData);
  }

  const { username, password } = validationResult.data;

  const usernameTaken = Boolean(await usersService.findByUsername(username));

  if (usernameTaken) {
    return res.status(409).json({
      error: {
        code: "USERNAME_TAKEN",
        message: `O nome de usuário "${username}" já está em uso`,
      },
    } satisfies ErrorData);
  }

  const user = await usersService.create({
    username: username,
    plainTextPassword: password,
  });

  res.status(201).json({
    user: {
      ...user,
      createdAt: user.createdAt.toISOString(),
    },
  } satisfies UserData);
};
