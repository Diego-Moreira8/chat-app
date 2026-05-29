/* eslint-disable react-refresh/only-export-components */

import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/chat")({
  component: ChatComponent,
  beforeLoad: async ({ context }) => {
    const accessToken = await context.queryClient.getQueryData([
      "user",
      "accessToken",
    ]);

    if (!accessToken)
      throw redirect({
        to: "/entrar",
        statusCode: 401,
        search: { message: "Você precisa entrar para acessar o Chat." },
      });
  },
});

function ChatComponent() {
  return (
    <>
      <h1>Chat</h1>
    </>
  );
}
