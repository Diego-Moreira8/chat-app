/* eslint-disable react-refresh/only-export-components */

import {
  User,
  type RegisterUserRequestBody,
  type RegisterUserResponse,
} from "@chat-app/shared/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { handleApiError } from "../api/handle-api-errors";
import { api } from "../api/instance";
import { Input } from "../components/ui/input";

export const Route = createFileRoute("/criar-conta")({
  component: RegisterComponent,
});

function RegisterComponent() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const navigate = Route.useNavigate();

  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm({ resolver: zodResolver(User.register.request) });

  const onSubmit: SubmitHandler<RegisterUserRequestBody> = async ({
    username,
    password,
  }: RegisterUserRequestBody) => {
    setLoading(true);
    setResult("");

    try {
      await api.post<RegisterUserResponse>("/api/v1/auth/register", {
        username,
        password,
      });

      navigate({ to: "/entrar" });
    } catch (error) {
      const usernameTaken =
        isAxiosError(error) &&
        error.response?.data?.error?.code === "USERNAME_TAKEN";

      if (usernameTaken) {
        setError("username", {
          message: "Este nome de usuário já está em uso! Tente outro.",
        });
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
      <h1>Crie uma conta e comece a conversar!</h1>

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
          autoComplete="new-password"
          label="Senha"
          registration={register("password")}
          error={errors.password?.message}
        />

        <div>
          <button type="submit" disabled={loading}>
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
