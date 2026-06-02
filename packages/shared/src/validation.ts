import * as z from "zod";

const NON_EMPTY_MSG = "Este campo é obrigatório";

// Todo: change to Users
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
      user: z.object({
        id: z.number(),
        username: z.string(),
        createdAt: z.string(),
      }),
    }),
  },
};

// Todo: change to Messages
export const Message = {
  create: {
    request: z.object({
      content: z
        .string()
        .trim()
        .nonempty(NON_EMPTY_MSG)
        .max(250, "Mensagens podem ter no máximo 250 caracteres"),
    }),

    response: z.object({
      message: z.object({
        id: z.number(),
        content: z.string(),
        createdAt: z.date(),
        owner: z.object({
          username: z.string(),
        }),
      }),
    }),
  },
};

export type RegisterUserRequestBody = z.infer<typeof User.register.request>;
export type RegisterUserResponse = z.infer<typeof User.register.response>;

export type LoginRequestBody = z.infer<typeof User.login.request>;
export type LoginResponse = z.infer<typeof User.login.response>;

export type UserDataResponse = z.infer<typeof User.data.response>;

export type CreateMessageRequestBody = z.infer<typeof Message.create.request>;
export type CreateMessageResponse = z.infer<typeof Message.create.response>;
