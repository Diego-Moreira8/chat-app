import { NextFunction, Request, Response } from "express";
import * as usersService from "../services/users";
import { User } from "@chat-app/shared/dist/validation";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { username, password } = req.body;

  const validationResult = User.register.safeParse({ username, password });

  if (!validationResult.success) {
    return res.status(400).json({ error: validationResult.error.issues });
  }

  const newUser = await usersService.create({
    username: username,
    plainTextPassword: password,
  });

  res.status(201).json({ user: newUser });
};
