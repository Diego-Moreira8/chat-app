/* eslint-disable react-refresh/only-export-components */

import type { UserData } from "@chat-app/shared";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Header } from "../components/header";

export const Route = createFileRoute("/_app")({
  component: AppRootComponent,
  beforeLoad: ({ context }) => {
    const accessToken = context.queryClient.getQueryData<string>([
      "user",
      "accessToken",
    ]);

    const userData = context.queryClient.getQueryData<UserData>([
      "user",
      "data",
    ]);

    if (!accessToken || !userData) {
      throw redirect({
        to: "/entrar",
        search: { alert: "UNAUTHORIZED" },
      });
    }

    // Pass the user data down to all app routes
    return {
      accessToken,
      userData,
    };
  },
});

function AppRootComponent() {
  const { userData } = Route.useRouteContext();

  return (
    <div>
      <Header username={userData.user.username} />
      <Outlet />
    </div>
  );
}
