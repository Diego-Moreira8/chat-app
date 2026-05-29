import express from "express";

export const usersRouter = express.Router();

usersRouter.get("/me", (req, res) =>
  res.json({ message: "Hello, from users/me" }),
);
