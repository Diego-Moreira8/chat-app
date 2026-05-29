import { User } from "@chat-app/shared/validation";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import * as usersService from "../services/users";
import { env } from "../config/env";
import { errorCodes } from "../utils/error-codes";

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
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ sub: user.id }, env.jwtSecret, {
    expiresIn: "7d",
  });

  res
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
