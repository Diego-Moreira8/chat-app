/* eslint-disable react-refresh/only-export-components */

import { errorCodes, LoginBody, type AccessToken } from "@chat-app/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { useForm } from "react-hook-form";
import { handleApiError } from "../api/handle-api-errors";
import { api } from "../api/instance";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Link } from "../components/ui/link";

type Alert = "REGISTRATION_SUCCESS" | "SESSION_EXPIRED" | "UNAUTHORIZED";

interface LoginSearchParams {
  alert?: Alert;
}

export const Route = createFileRoute("/_auth/entrar")({
  component: LoginComponent,
  validateSearch: (search: Record<string, unknown>): LoginSearchParams => {
    return {
      alert: (search.alert as Alert) || "",
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

  const alertMessages = {
    REGISTRATION_SUCCESS:
      "Sua conta foi criada! Você pode entrar com ela agora.",
    SESSION_EXPIRED:
      "Sua sessão expirou! Entre com suas credenciais novamente.",
    UNAUTHORIZED: "Você precisa entrar para acessar o chat!",
  };

  return (
    <div className="flex h-full flex-col gap-4">
      {alert && (
        <Card
          centered
          color={alert === "REGISTRATION_SUCCESS" ? "success" : "alert"}
          size="sm"
        >
          <p className="text-center">{alertMessages[alert]}</p>
        </Card>
      )}

      <h1 className="text-center text-4xl font-bold">Entrar</h1>

      <p className="text-center">
        Já tem uma conta?
        <br />
        Entre com suas credenciais e volte a conversar!
      </p>

      <form
        className="flex flex-col gap-4 rounded-2xl border-3 border-black bg-white/50 p-4 shadow-md dark:border-white dark:bg-white/10"
        onSubmit={handleSubmit((credentials) =>
          postLoginMutation.mutateAsync(credentials),
        )}
      >
        {errors.form?.message && (
          <Card centered color="alert" size="sm">
            <p className="text-center">{errors.form?.message}</p>
          </Card>
        )}

        <div className="flex flex-col gap-2">
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
        </div>

        <Button type="submit" loading={postLoginMutation.isPending}>
          {postLoginMutation.isPending ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <p className="text-center">
        Ainda não tem uma conta? <Link to="/criar-conta">Registre-se</Link>
      </p>
    </div>
  );
}
