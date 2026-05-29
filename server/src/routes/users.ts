import express from "express";
import * as usersController from "../controllers/users";
import { auth } from "../middlewares/auth";

export const usersRouter = express.Router();

usersRouter.get("/me", auth, usersController.getMe);
