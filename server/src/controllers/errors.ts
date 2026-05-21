import { NextFunction, Request, Response } from "express";

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("----- Begin of Error -----\n");
  console.error(err.message);
  console.error(err.stack);
  console.error("\n------ End of Error ------");

  res.sendStatus(500);
};
