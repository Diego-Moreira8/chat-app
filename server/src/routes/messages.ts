import express from "express";
import * as msgsController from "../controllers/messages";
import { auth } from "../middlewares/auth";

export const messagesRouter = express.Router();

messagesRouter.get("/", auth, msgsController.getMessage);
messagesRouter.post("/", auth, msgsController.createMessage);
