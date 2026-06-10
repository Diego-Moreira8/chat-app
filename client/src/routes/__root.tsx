/* eslint-disable react-refresh/only-export-components */

import {
  accessTokenMaxAge,
  errorCodes,
  type AccessToken,
  type UserData,
} from "@chat-app/shared";
import { useQuery, type QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { api } from "../api/instance";
import { queryClient } from "../queryClient";
import { isAxiosError } from "axios";
import { useEffect, useState } from "react";

export interface RouterContext {
  queryClient?: QueryClient;
  accessToken?: string | null;
  userData?: UserData;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  beforeLoad: () => {
    // Pass down the queryClient to all routes
    return { queryClient };
  },
});

function RootComponent() {
  const [forcedLogout, setForcedLogout] = useState(false);

  const navigate = Route.useNavigate();

  /**
   * Initial queries
   */

  const pingServerQuery = useQuery({
    queryKey: ["serverStatus"],
    queryFn: () => api.get("/ping"),
  });

  const accessTokenQuery = useQuery({
    queryKey: ["user", "accessToken"],
    enabled: Boolean(pingServerQuery.data),
    staleTime: ({ state }) => {
      // Prevent stale when no data
      if (!state.data) {
        return Infinity;
      }

      return accessTokenMaxAge;
    },
    refetchInterval: ({ state }) => {
      // Prevent refetch when no refresh token
      if (!state.data) {
        return false;
      }

      return accessTokenMaxAge - 1000; // 1 sec before for safety
    },
    queryFn: async () => {
      setForcedLogout(false);

      try {
        const response = await api.get<AccessToken>("/api/v1/auth/refresh", {
          withCredentials: true,
        });

        return response.data.accessToken;
      } catch (error) {
        if (isAxiosError(error)) {
          const invalidRefreshToken =
            error.response?.data.error.code === errorCodes.AUTH_ERROR;

          if (invalidRefreshToken) {
            const wasLoggedIn = accessTokenQuery.data;

            if (wasLoggedIn) setForcedLogout(true);

            queryClient.setQueryData(["user", "data"], null);

            return null;
          }
        }

        throw error;
      }
    },
  });

  const userDataQuery = useQuery({
    queryKey: ["user", "data"],
    enabled: Boolean(accessTokenQuery.data),
    queryFn: async () => {
      const response = await api.get<UserData>("/api/v1/users/me", {
        headers: {
          Authorization: `Bearer ${accessTokenQuery.data}`,
        },
      });

      return response.data;
    },
  });

  const isAuthenticating =
    accessTokenQuery.isLoading || userDataQuery.isFetching;

  const isLoading = pingServerQuery.isLoading || isAuthenticating;

  /**
   * Redirection rules
   */

  useEffect(() => {
    if (isLoading) return;

    if (userDataQuery.data) {
      navigate({ to: "/chat" });
    } else if (forcedLogout) {
      navigate({
        to: "/entrar",
        search: {
          alert: "Sua sessão expirou! Entre com suas credenciais novamente.",
        },
      });
    } else {
      navigate({ to: "/entrar" });
    }
  }, [isLoading, userDataQuery.data, forcedLogout, navigate]);

  /**
   * Render
   */

  if (pingServerQuery.isLoading) {
    return (
      <p>
        ⌛ Acordando servidor...{" "}
        {pingServerQuery.failureCount > 0 &&
          `Tentativa ${pingServerQuery.failureCount}`}
      </p>
    );
  }

  if (pingServerQuery.isError) {
    return <p>❌ O servidor não acordou! Tente novamente mais tarde.</p>;
  }

  if (isAuthenticating) {
    return <p>🔐 Tentando autenticar usuário...</p>;
  }

  return (
    <>
      <div>
        <Outlet />
      </div>

      <TanStackRouterDevtools position="top-right" />
    </>
  );
}

function NotFoundComponent() {
  return (
    <>
      <h1>404</h1>
      <p>Ops... Esta página não existe!</p>
      <Link to="/">Voltar para o início</Link>
    </>
  );
}
