/* eslint-disable react-refresh/only-export-components */

import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Logo } from "../components/logo";
import { ExternalLink } from "../components/ui/link";

export const Route = createFileRoute("/_auth")({
  component: AuthRootComponent,
  beforeLoad: async ({ context }) => {
    const userData = await context.queryClient.getQueryData(["user", "data"]);

    if (userData) {
      throw redirect({ to: "/chat" });
    }
  },
});

function AuthRootComponent() {
  return (
    <div className="flex flex-col gap-8 p-4">
      <Logo />
      <Outlet />
      <footer>
        <p className="text-center">
          App criado por{" "}
          <ExternalLink href="https://diegowebdev.com.br">
            Diego Moreira
          </ExternalLink>{" "}
          em 2026
        </p>
      </footer>
    </div>
  );
}
