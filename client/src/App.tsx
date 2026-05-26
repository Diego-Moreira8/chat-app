import {
  User,
  type RegisterUserRequestBody,
  type RegisterUserResponse,
} from "@chat-app/shared/dist/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { api } from "./api/instance";
import { Input } from "./components/ui/input";

export function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const {
    register,
    handleSubmit,
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

        if (error.response?.status === 400) {
          setResult("Há um erro no formulário! Corrija e tente novamente.");
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
