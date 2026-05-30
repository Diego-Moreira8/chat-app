/* eslint-disable react-refresh/only-export-components */

import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Header } from "../components/header";

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
      <Header />
      <Outlet />
    </>
  );
}
