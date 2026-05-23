import express from "express";
import * as usersController from "../controllers/users";

export const usersRouter = express.Router();

usersRouter.post("/", usersController.create);
