/* eslint-disable react-refresh/only-export-components */

import {
  User,
  type RegisterUserRequestBody,
  type RegisterUserResponse,
} from "@chat-app/shared/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { Input } from "../components/ui/input";
import { api } from "../api/instance";

export const Route = createFileRoute("/register")({
  component: RegisterComponent,
});

function RegisterComponent() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(User.register.request) });

  const onSubmit: SubmitHandler<RegisterUserRequestBody> = async ({
    username,
    password,
  }) => {
    setLoading(true);
    setResult("");

    try {
      const response = await api.post<RegisterUserResponse>(
        "/api/v1/auth/register",
        { username, password },
      );

      console.log(response.data);
      setResult("Usuário criado!");
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status && error.response.status >= 500) {
          setResult("Houve um erro no servidor");
          return;
        }

        if (error.response?.data.error.code === "VALIDATION_ERROR") {
          setResult("Há um erro no formulário! Corrija-o e tente novamente.");
          return;
        }

        if (error.response?.data.error.code === "USERNAME_TAKEN") {
          setError("username", {
            message: "Este nome de usuário já está em uso! Tente outro.",
          });
          return;
        }
      }

      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1>Crie uma conta e comece a conversar!</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        {result && <p>{result}</p>}

        <Input
          type="text"
          label="Nome de usuário"
          registration={register("username")}
          error={errors.username?.message}
        />

        <Input
          type="password"
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
    </>
  );
}
