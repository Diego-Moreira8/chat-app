import { User } from "@chat-app/shared/validation";
import { NextFunction, Request, Response } from "express";
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
        code: "VALIDATION_ERROR",
        message: "Dados inválidos",
        details: validationResult.error.issues,
      },
    });
  }

  const { username, password } = req.body;

  const validCredentials = await usersService.isValidCredentials({
    username: username,
    plainTextPassword: password,
  });

  if (!validCredentials) {
    return res.status(401).json({
      error: {
        code: "AUTH_ERROR",
        message: "Credenciais inválidas",
      },
    });
  }

  res.json({
    auth: {
      refreshToken: "refreshToken",
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
        code: "VALIDATION_ERROR",
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
        code: "USERNAME_TAKEN",
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
