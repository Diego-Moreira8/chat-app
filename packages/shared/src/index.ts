import * as z from "zod";
import { $ZodIssue } from "zod/v4/core";

/*******************************************************************************
 * Validators
 */
const NON_EMPTY_MSG = "Este campo é obrigatório";

export const UserRegisterBody = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Nomes de usuário devem ter entre 3 e 20 caracteres")
    .max(20, "Nomes de usuário devem ter entre 3 e 20 caracteres")
    .regex(
      /^[a-z0-9-]+$/,
      "Apenas letras, números e traços (-) são permitidos",
    ),
  password: z
    .string()
    .min(8, "A senha precisa ter no mínimo 8 caracteres")
    .max(50, "A senha pode ter no máximo 50 caracteres"),
});

export const LoginBody = z.object({
  username: z.string().trim().toLowerCase().nonempty(NON_EMPTY_MSG),
  password: z.string().nonempty(NON_EMPTY_MSG),
});

export const CreateMessageBody = z.object({
  content: z
    .string()
    .trim()
    .nonempty(NON_EMPTY_MSG)
    .max(250, "Mensagens podem ter no máximo 250 caracteres"),
});

export const GetMessagesQuery = z.object({
  cursor: z.coerce
    .number({ error: "'cursor' precisa ser um número" })
    .min(1, { error: "'cursor' precisa ser um número maior que 0" })
    .optional(),
});

export const DeleteMessageParams = z.object({
  id: z.coerce
    .number({ error: "'id' precisa ser um número" })
    .min(1, { error: "'id' precisa ser um número maior que 0" })
    .nonoptional({ error: "Um 'id' precisa ser informado" }),
});

export const UpdateMessageParams = z.object({
  id: z.coerce
    .number({ error: "'id' precisa ser um número" })
    .min(1, { error: "'id' precisa ser um número maior que 0" })
    .nonoptional({ error: "Um 'id' precisa ser informado" }),
});

/*******************************************************************************
 * Variables
 */

export const accessTokenMaxAge = 15 * 60 * 1000; // 15 min
export const refreshTokenMaxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

export const errorCodes = {
  AUTH_ERROR: "AUTH_ERROR",
  INVALID_ENDPOINT: "INVALID_ENDPOINT",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
  USERNAME_TAKEN: "USERNAME_TAKEN",
  VALIDATION_ERROR: "VALIDATION_ERROR",
};

/*******************************************************************************
 * Types
 */

export type UserRegisterBody = z.infer<typeof UserRegisterBody>;

export type UserData = {
  user: {
    id: number;
    username: string;
    createdAt: string; // Must convert from Date using .toISOString()
    // No password!
  };
};

export type LoginBody = z.infer<typeof LoginBody>;

export type AccessToken = {
  accessToken: string;
};

export type CreateMessageBody = z.infer<typeof CreateMessageBody>;

export type MessageData = {
  id: number;
  content: string;
  createdAt: string; // Must convert from Date using .toISOString()
  owner: {
    username: string;
  };
};

export type MessageDataResponse = {
  data: MessageData[];
  nextCursor?: number | null;
};

export type ErrorCode = keyof typeof errorCodes;

export type ErrorData = {
  error: {
    code: ErrorCode;
    message: string;
  };
};

export type ValidationErrorData = {
  error: {
    code: ErrorCode;
    message: string;
    details: $ZodIssue[];
  };
};
