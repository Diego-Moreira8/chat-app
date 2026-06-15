/* eslint-disable react-refresh/only-export-components */

import { errorCodes, UserRegisterBody, type UserData } from "@chat-app/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { useForm } from "react-hook-form";
import { handleApiError } from "../api/handle-api-errors";
import { api } from "../api/instance";
import { Input } from "../components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Link } from "../components/ui/link";

export const Route = createFileRoute("/_auth/criar-conta")({
  component: RegisterComponent,
});

function RegisterComponent() {
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm({ resolver: zodResolver(UserRegisterBody) });

  const navigate = Route.useNavigate();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async ({ username, password }: UserRegisterBody) => {
      return await api.post<UserData>("/api/v1/auth/register", {
        username,
        password,
      });
    },
    onSuccess: () => {
      navigate({
        to: "/entrar",
        search: { alert: "REGISTRATION_SUCCESS" },
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
      if (message) setError("form", { message });
    },
  });

  return (
    <div className="flex h-full flex-col gap-4">
      <h1 className="text-center text-4xl font-bold">Criar Conta</h1>

      <p className="text-center">
        Ainda não tem uma conta?
        <br />
        Crie uma e entre na conversa!
      </p>

      <form
        className="flex flex-col gap-4 rounded-2xl border-3 border-black bg-white/50 p-4 shadow-md dark:border-white dark:bg-white/10"
        onSubmit={handleSubmit((credentials) => mutateAsync(credentials))}
      >
        <p className="text-center">{errors.form?.message}</p>

        <div className="flex flex-col gap-2">
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
        </div>

        <Button type="submit" loading={isPending}>
          {isPending ? "Criando sua conta..." : "Criar conta"}
        </Button>
      </form>

      <p className="text-center">
        Já tem uma conta? <Link to="/entrar">Entrar</Link>
      </p>
    </div>
  );
}
