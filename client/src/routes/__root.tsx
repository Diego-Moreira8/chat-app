/* eslint-disable react-refresh/only-export-components */

import { useQuery } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { api } from "../api/instance";
import { Header } from "../components/header";
import type { RouterContext } from "../router";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  const { isError, isLoading, failureCount } = useQuery({
    queryKey: ["serverStatus"],
    queryFn: () => api.get("/ping"),
    staleTime: Infinity,
  });

  if (isLoading) {
    return (
      <p>
        ⌛ Acordando servidor...{" "}
        {failureCount > 0 && `Tentativa ${failureCount}`}
      </p>
    );
  }

  if (isError) {
    return <p>❌ O servidor não acordou! Tente novamente mais tarde.</p>;
  }

  return (
    <>
      <Header />

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
