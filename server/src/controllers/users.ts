import { NextFunction, Request, Response } from "express";
import * as usersService from "../services/users";
import { RegisterUserResponse } from "@chat-app/shared/validation";

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
  } satisfies RegisterUserResponse);
};
