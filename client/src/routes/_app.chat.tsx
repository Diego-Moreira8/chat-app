/* eslint-disable react-refresh/only-export-components */

import type { MessageData } from "@chat-app/shared";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { api } from "../api/instance";
import { MessageForm } from "../components/message-form";
import { MessagesList } from "../components/messages-list";

export const Route = createFileRoute("/_app/chat")({
  component: ChatComponent,
});

function ChatComponent() {
  const [messageToEdit, setMessageToEdit] = useState<MessageData | null>(null);

  /**
   * Allow the useEffect in the <MessagesList/> to scroll down the container
   */
  const shouldScrollDown = useRef(false);

  const { queryClient } = useRouteContext({ from: "/_app" });

  const updateMessageMutation = useMutation({
    mutationFn: async ({ id, content }: MessageData) => {
      const accessToken = queryClient.getQueryData<string>([
        "user",
        "accessToken",
      ]);

      const response = await api.patch(
        `/api/v1/messages/${id}`,
        { content },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      setMessageToEdit(null);
    },
    onError: () => {
      // TODO
    },
  });

  return (
    // Height = full - header height
    <div className="h-[calc(100%-3rem)]">
      <MessagesList
        messageToEdit={messageToEdit}
        shouldScrollDown={shouldScrollDown}
        onEdit={setMessageToEdit}
      />

      <MessageForm
        messageToEdit={messageToEdit}
        updateMessageStatus={updateMessageMutation.status}
        shouldScrollDown={shouldScrollDown}
        onSubmitMessageChanges={updateMessageMutation.mutateAsync}
      />
    </div>
  );
}
