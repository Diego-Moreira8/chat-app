import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ context }) => {
    const accessToken = await context.queryClient.getQueryData([
      "user",
      "accessToken",
    ]);

    if (accessToken) {
      throw redirect({ to: "/chat" });
    }
  },
});
