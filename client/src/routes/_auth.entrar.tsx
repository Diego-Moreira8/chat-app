/* eslint-disable react-refresh/only-export-components */

import {
  User,
  type LoginRequestBody,
  type LoginResponse,
} from "@chat-app/shared/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { handleApiError } from "../api/handle-api-errors";
import { api } from "../api/instance";
import { Input } from "../components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface LoginSearchParams {
  alert?: string;
}

export const Route = createFileRoute("/_auth/entrar")({
  component: LoginComponent,
  validateSearch: (search: Record<string, unknown>): LoginSearchParams => {
    return {
      alert: (search.alert as string) || "",
    };
  },
});

function LoginComponent() {
  const [result, setResult] = useState("");

  const { alert } = Route.useSearch();
  const navigate = Route.useNavigate();

  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async ({ username, password }: LoginRequestBody) => {
      return await api.post<LoginResponse>(
        "/api/v1/auth/login",
        {
          username,
          password,
        },
        {
          withCredentials: true,
        },
      );
    },
    onSuccess: (response) => {
      queryClient.setQueryData(
        ["user", "accessToken"],
        response.data.auth.accessToken,
      );

      navigate({ to: "/chat" });
    },
    onError: (error) => {
      const invalidCredentials =
        isAxiosError(error) && error.response?.data.error.code === "AUTH_ERROR";

      if (invalidCredentials) {
        setResult("Nome de usuário ou senha incorretos. Tente novamente.");
        return;
      }

      const message = handleApiError(error);
      if (message) setResult(message);
    },
  });

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm({ resolver: zodResolver(User.login.request) });

  return (
    <>
      <h1>Entre com a sua conta</h1>

      <form onSubmit={handleSubmit((credentials) => mutateAsync(credentials))}>
        <p>{result}</p>
        <p>{alert}</p>

        <Input
          autoFocus
          type="text"
          autoComplete="username"
          label="Nome de usuário"
          registration={register("username")}
          error={errors.username?.message}
        />

        <Input
          type="password"
          autoComplete="current-password"
          label="Senha"
          registration={register("password")}
          error={errors.username?.message}
        />

        <div>
          <button type="submit" disabled={isPending}>
            Entrar
          </button>
        </div>
      </form>

      <p>
        Ainda não tem uma conta? <Link to="/criar-conta">Registre-se</Link>
      </p>
    </>
  );
}
