import { prisma, User } from "@chat-app/shared";
import express from "express";

export const usersRouter = express.Router();

usersRouter.get("/", async (req, res, next) => {
  const userTest: User = {
    id: 1,
    username: "user",
    passwordHash: "123",
  };

  const newUser = await prisma.user.create({ data: userTest });

  res.json({ user: newUser });
});
