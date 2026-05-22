import { prisma, User } from "@chat-app/shared";
import express from "express";

export const usersRouter = express.Router();

usersRouter.get("/", async (req, res, next) => {
  const newUser = await prisma.user.create({
    data: {
      username: "test",
      passwordHash: "123",
    },
  });

  res.json({ user: newUser });
});
