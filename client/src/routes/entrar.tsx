/* eslint-disable react-refresh/only-export-components */

import {
  User,
  type LoginRequestBody,
  type LoginResponse,
} from "@chat-app/shared/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { handleApiError } from "../api/handle-api-errors";
import { api } from "../api/instance";
import { Input } from "../components/ui/input";

export const Route = createFileRoute("/entrar")({
  component: LoginComponent,
});

function LoginComponent() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm({ resolver: zodResolver(User.login.request) });

  const onSubmit: SubmitHandler<LoginRequestBody> = async ({
    username,
    password,
  }: LoginRequestBody) => {
    setLoading(true);
    setResult("");

    try {
      const response = await api.post<LoginResponse>("/api/v1/auth/login", {
        username,
        password,
      });

      console.log(response.data);

      setResult("Login realizado!");
    } catch (error) {
      const invalidCredentials =
        isAxiosError(error) && error.response?.data.error.code === "AUTH_ERROR";

      if (invalidCredentials) {
        setResult("Nome de usuário ou senha incorretos. Tente novamente.");
        return;
      }

      const message = handleApiError(error);
      if (message) setResult(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1>Entre com a sua conta</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <p>{result}</p>

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
          <button type="submit" disabled={loading}>
            Entrar
          </button>
        </div>
      </form>
    </>
  );
}
