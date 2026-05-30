/* eslint-disable react-refresh/only-export-components */

import type { UserDataResponse } from "@chat-app/shared/validation";
import { useQuery, type QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { api } from "../api/instance";
import { queryClient } from "../queryClient";

export interface RouterContext {
  queryClient?: QueryClient;
  accessToken?: string;
  userData?: UserDataResponse;
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
  const pingServer = useQuery({
    queryKey: ["serverStatus"],
    queryFn: () => api.get("/ping"),
    staleTime: Infinity,
  });

  if (pingServer.isLoading) {
    return (
      <p>
        ⌛ Acordando servidor...{" "}
        {pingServer.failureCount > 0 && `Tentativa ${pingServer.failureCount}`}
      </p>
    );
  }

  if (pingServer.isError) {
    return <p>❌ O servidor não acordou! Tente novamente mais tarde.</p>;
  }

  return (
    <>
      <main>
        <Outlet />
      </main>

      <TanStackRouterDevtools />
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
