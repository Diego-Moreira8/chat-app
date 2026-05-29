import express from "express";

export const messagesRouter = express.Router();

messagesRouter.get("/", (req, res) =>
  res.json({ message: "Hello, from messages" }),
);
