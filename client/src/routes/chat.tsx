/* eslint-disable react-refresh/only-export-components */

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/chat")({
  component: ChatComponent,
});

function ChatComponent() {
  return <h1>Hello "/chat"!</h1>;
}
