import * as z from "zod";

const NON_EMPTY_MSG = "Este campo é obrigatório";

export const User = {
  register: {
    request: z.object({
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
    }),

    response: z.object({
      user: z.object({
        id: z.number(),
        username: z.string(),
        createdAt: z.string(),
      }),
    }),
  },

  login: {
    request: z.object({
      username: z.string().trim().toLowerCase().nonempty(NON_EMPTY_MSG),
      password: z.string().nonempty(NON_EMPTY_MSG),
    }),

    response: z.object({
      auth: z.object({
        accessToken: z.string(),
      }),
    }),
  },

  data: {
    response: z.object({
      id: z.number(),
      username: z.string(),
      createdAt: z.string(),
    }),
  },
};

export type RegisterUserRequestBody = z.infer<typeof User.register.request>;
export type RegisterUserResponse = z.infer<typeof User.register.response>;

export type LoginRequestBody = z.infer<typeof User.login.request>;
export type LoginResponse = z.infer<typeof User.login.response>;

export type UserDataResponse = z.infer<typeof User.data.response>;
