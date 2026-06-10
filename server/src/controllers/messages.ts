import {
  CreateMessageBody,
  DeleteMessageParams,
  GetMessagesQuery,
  type ErrorData,
  type MessageDataResponse,
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
    data: [
      {
        ...message,
        createdAt: message.createdAt.toISOString(),
      },
    ],
  } satisfies MessageDataResponse);
};

export const deleteMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const validationResult = DeleteMessageParams.safeParse(req.params);

  if (!validationResult.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Dados inválidos",
        details: validationResult.error.issues,
      },
    } satisfies ValidationErrorData);
  }

  const { id } = validationResult.data;

  const message = await msgsService.findById(id, { withUserId: true });

  if (!message) return res.sendStatus(404);

  const userOwnsMessage = message.owner.id === res.locals.sub;

  if (!userOwnsMessage) {
    return res.status(403).json({
      error: {
        code: "INSUFFICIENT_PERMISSIONS",
        message: "You must own the message to delete it",
      },
    } satisfies ErrorData);
  }

  await msgsService.deleteMessage(id);

  res.sendStatus(204);
};

export const getMessagesDescending = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const validationResult = GetMessagesQuery.safeParse(req.query);

  if (!validationResult.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Dados inválidos",
        details: validationResult.error.issues,
      },
    } satisfies ValidationErrorData);
  }

  const { cursor } = validationResult.data;

  const messages = await msgsService.getDescending({
    cursor,
    skip: 1,
    take: 10,
  });

  const mappedMessages = messages.map((msg) => ({
    ...msg,
    createdAt: msg.createdAt.toISOString(),
  }));

  res.json({
    data: mappedMessages,
    nextCursor: mappedMessages[mappedMessages.length - 1]?.id || null,
  } satisfies MessageDataResponse);
};
