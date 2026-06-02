/* eslint-disable react-refresh/only-export-components */

import { createFileRoute } from "@tanstack/react-router";
import { MessageForm } from "../components/message-form";

export const Route = createFileRoute("/_app/chat")({
  component: ChatComponent,
});

function ChatComponent() {
  return (
    <>
      <h1>Chat</h1>

      <MessageForm />
    </>
  );
}
