import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app")({
  beforeLoad: async ({ context }) => {
    const accessToken = await context.queryClient.getQueryData([
      "user",
      "accessToken",
    ]);

    if (!accessToken) {
      throw redirect({
        to: "/entrar",
        search: { alert: "Você precisa entrar para acessar o chat." },
      });
    }
  },
});
