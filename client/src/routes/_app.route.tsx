/* eslint-disable react-refresh/only-export-components */

import type { UserData } from "@chat-app/shared";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Header } from "../components/header";

export const Route = createFileRoute("/_app")({
  component: AppRootComponent,
  beforeLoad: ({ context }) => {
    const userData = context.queryClient.getQueryData<UserData>([
      "user",
      "data",
    ]);

    if (!userData) {
      throw redirect({
        to: "/entrar",
        search: { alert: "Você precisa entrar para acessar o chat." },
      });
    }

    // Pass the user data down to all app routes
    return { userData };
  },
});

function AppRootComponent() {
  const { userData } = Route.useRouteContext();
  return (
    <>
      <Header userData={userData} />
      <Outlet />
    </>
  );
}
