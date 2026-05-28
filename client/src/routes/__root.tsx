/* eslint-disable react-refresh/only-export-components */

import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/" activeProps={{ style: { fontWeight: "bold" } }}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/entrar" activeProps={{ style: { fontWeight: "bold" } }}>
              Entrar
            </Link>
          </li>
          <li>
            <Link
              to="/criar-conta"
              activeProps={{ style: { fontWeight: "bold" } }}
            >
              Criar conta
            </Link>
          </li>
        </ul>
      </nav>

      <Outlet />

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
