import { User } from "@chat-app/shared/dist/validation";
import { NextFunction, Request, Response } from "express";
import * as usersService from "../services/users";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { username, password } = req.body;

  const validationResult = User.register.request.safeParse({
    username,
    password,
  });

  if (!validationResult.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Dados inválidos",
        details: validationResult.error.issues,
      },
    });
  }

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
