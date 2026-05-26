import * as z from "zod";

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
};

export type RegisterUserRequestBody = z.infer<typeof User.register.request>;
export type RegisterUserResponse = z.infer<typeof User.register.response>;
