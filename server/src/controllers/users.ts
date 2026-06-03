import { type UserData } from "@chat-app/shared";
import { NextFunction, Request, Response } from "express";
import * as usersService from "../services/users";

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = res.locals.sub!; // Coming from the auth middleware

  const user = await usersService.findById(userId);

  if (!user) {
    return res.sendStatus(404);
  }

  res.json({
    user: {
      ...user,
      createdAt: user.createdAt.toISOString(),
    },
  } satisfies UserData);
};
