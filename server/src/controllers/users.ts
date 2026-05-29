import { NextFunction, Request, Response } from "express";
import * as usersService from "../services/users";

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = res.locals.sub!; // Coming from the auth middleware

  const userData = await usersService.findById(userId);

  if (!userData) {
    return res.sendStatus(404);
  }

  res.json({
    user: userData,
  });
};
