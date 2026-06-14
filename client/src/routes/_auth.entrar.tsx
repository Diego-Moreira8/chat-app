/* eslint-disable react-refresh/only-export-components */

import { errorCodes, LoginBody, type AccessToken } from "@chat-app/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { useForm } from "react-hook-form";
import { handleApiError } from "../api/handle-api-errors";
import { api } from "../api/instance";
import { Input } from "../components/ui/input";

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
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm({ resolver: zodResolver(LoginBody) });

  const { alert } = Route.useSearch();
  const navigate = Route.useNavigate();

  const queryClient = useQueryClient();

  const postLoginMutation = useMutation({
    mutationFn: async ({ username, password }: LoginBody) => {
      const response = await api.post<AccessToken>(
        "/api/v1/auth/login",
        { username, password },
        { withCredentials: true },
      );

      return response.data;
    },
    onSuccess: async ({ accessToken }) => {
      queryClient.setQueryData(["user", "accessToken"], accessToken);

      navigate({ to: "/" });

      await queryClient.invalidateQueries({ queryKey: ["user", "data"] });
    },
    onError: (error) => {
      const invalidCredentials =
        isAxiosError(error) &&
        error.response?.data.error.code === errorCodes.AUTH_ERROR;

      if (invalidCredentials) {
        setError("form", {
          message: "Nome de usuário ou senha incorretos. Tente novamente.",
        });
        return;
      }

      const message = handleApiError(error);
      if (message) setError("form", { message });
    },
  });

  return (
    <>
      <h1 className="text-center text-4xl font-bold">Entrar</h1>

      <p className="text-center">
        Já tem uma conta? Entre com suas credenciais e volte a conversar!
      </p>

      <form
        onSubmit={handleSubmit((credentials) =>
          postLoginMutation.mutateAsync(credentials),
        )}
      >
        <p>{errors.form?.message}</p>
        <p>{alert}</p>

        <Input
          autoFocus
          type="text"
          autoComplete="username"
          label="Nome de usuário"
          registration={register("username")}
          error={errors.username?.message}
          disabled={postLoginMutation.isPending}
        />

        <Input
          type="password"
          autoComplete="current-password"
          label="Senha"
          registration={register("password")}
          error={errors.username?.message}
          disabled={postLoginMutation.isPending}
        />

        <div>
          <button type="submit" disabled={postLoginMutation.isPending}>
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
