import {
  CreateMessageBody,
  type MessageData,
  type ValidationErrorData,
} from "@chat-app/shared";
import { NextFunction, Request, Response } from "express";
import * as msgsService from "../services/messages";

export const createMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const validationResult = CreateMessageBody.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Dados inválidos",
        details: validationResult.error.issues,
      },
    } satisfies ValidationErrorData);
  }

  const { content } = validationResult.data;

  const ownerId = res.locals.sub;

  if (!ownerId) throw new Error("User ID was not defined on auth middleware");

  const message = await msgsService.create({ ownerId, content });

  res.json({
    message: {
      ...message,
      createdAt: message.createdAt.toISOString(),
    },
  } satisfies MessageData);
};
