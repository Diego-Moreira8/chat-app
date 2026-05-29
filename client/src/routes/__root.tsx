/* eslint-disable react-refresh/only-export-components */

import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { RouterContext } from "../router";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
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

function Header() {
  return (
    <header>
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
          <li>
            <Link to="/chat" activeProps={{ style: { fontWeight: "bold" } }}>
              Chat
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
