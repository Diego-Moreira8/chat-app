import { NextFunction, Request, Response } from "express";
import * as msgsService from "../services/messages";
import { Message } from "@chat-app/shared/validation";
import { errorCodes } from "@chat-app/shared/variables";

export const createMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const validationResult = Message.create.request.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      error: {
        code: errorCodes.VALIDATION_ERROR,
        message: "Dados inválidos",
        details: validationResult.error.issues,
      },
    });
  }

  const { content } = validationResult.data;

  const ownerId = res.locals.sub;

  if (!ownerId) throw new Error("User ID was not defined on auth middleware");

  const newMessage = await msgsService.create({ ownerId, content });

  res.json({
    newMessage,
  });
};
