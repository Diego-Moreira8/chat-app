/* eslint-disable react-refresh/only-export-components */

import { errorCodes } from "@chat-app/shared/error-codes";
import {
  User,
  type RegisterUserRequestBody,
  type RegisterUserResponse,
} from "@chat-app/shared/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { handleApiError } from "../api/handle-api-errors";
import { api } from "../api/instance";
import { Input } from "../components/ui/input";
import { useMutation } from "@tanstack/react-query";

export const Route = createFileRoute("/_auth/criar-conta")({
  component: RegisterComponent,
});

function RegisterComponent() {
  const [result, setResult] = useState("");

  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm({ resolver: zodResolver(User.register.request) });

  const navigate = Route.useNavigate();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async ({ username, password }: RegisterUserRequestBody) => {
      return await api.post<RegisterUserResponse>("/api/v1/auth/register", {
        username,
        password,
      });
    },
    onSuccess: () => {
      navigate({
        to: "/entrar",
        search: {
          alert:
            "Usuário criado com sucesso! Você pode entrar com suas credenciais agora.",
        },
      });
    },
    onError: (error) => {
      const usernameTaken =
        isAxiosError(error) &&
        error.response?.data?.error?.code === errorCodes.USERNAME_TAKEN;

      if (usernameTaken) {
        setError("username", {
          message: "Este nome de usuário já está em uso! Tente outro.",
        });
        return;
      }

      const message = handleApiError(error);
      if (message) setResult(message);
    },
  });

  return (
    <>
      <h1>Crie uma conta e comece a conversar!</h1>

      <form onSubmit={handleSubmit((credentials) => mutateAsync(credentials))}>
        <p>{result}</p>

        <Input
          autoFocus
          type="text"
          autoComplete="username"
          label="Nome de usuário"
          registration={register("username")}
          error={errors.username?.message}
          disabled={isPending}
        />

        <Input
          type="password"
          autoComplete="new-password"
          label="Senha"
          registration={register("password")}
          error={errors.password?.message}
          disabled={isPending}
        />

        <div>
          <button type="submit" disabled={isPending}>
            Criar conta
          </button>
        </div>
      </form>

      <p>
        Já tem uma conta? <Link to="/entrar">Entrar</Link>
      </p>
    </>
  );
}
