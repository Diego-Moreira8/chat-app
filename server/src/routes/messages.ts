import express from "express";
import * as msgsController from "../controllers/messages";
import { auth } from "../middlewares/auth";

export const messagesRouter = express.Router();

messagesRouter.post("/", auth, msgsController.createMessage);
messagesRouter.get("/", auth, msgsController.getMessagesDescending);
messagesRouter.delete("/:id", auth, msgsController.deleteMessage);
