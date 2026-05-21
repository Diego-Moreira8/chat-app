import express from "express";

export const indexRouter = express.Router();

indexRouter.get("/", (req, res) => {
  res.json({ message: `Hello, World! ${new Date().toLocaleString()}` });
});
