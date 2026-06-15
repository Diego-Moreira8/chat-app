/* eslint-disable react-refresh/only-export-components */

import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Logo } from "../components/logo";

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
    <>
      <div className="flex flex-col gap-8">
        <Logo />

        <Outlet />
      </div>
    </>
  );
}
