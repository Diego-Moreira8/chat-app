import { NextFunction, Request, Response } from "express";
import * as usersService from "../services/users";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { username, password } = req.body;
  const newUser = await usersService.create({
    username: username,
    plainTextPassword: password,
  });

  res.status(201).json({ user: newUser });
};
