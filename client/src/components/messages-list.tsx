import type { MessageDataResponse, MessageData } from "@chat-app/shared";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import type React from "react";
import { MessageBalloon } from "./message-balloon";
import { api } from "../api/instance";

interface MessagesListProps {
  messageToEdit: MessageData | null;
  onEdit: React.Dispatch<React.SetStateAction<MessageData | null>>;
}

export function MessagesList({ messageToEdit, onEdit }: MessagesListProps) {
  const { queryClient } = useRouteContext({ from: "/_app" });

  const { data } = useInfiniteQuery({
    queryKey: ["messages"],
    staleTime: 5000,
    refetchInterval: 5000,
    queryFn: async ({ pageParam }) => {
      const accessToken = queryClient.getQueryData<string>([
        "user",
        "accessToken",
      ]);

      const response = await api.get<MessageDataResponse>(
        `/api/v1/messages${pageParam === Infinity ? "" : `?cursor=${pageParam}`}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      return response.data;
    },
    initialPageParam: Infinity, // Cannot start at 0 for a descending cursor
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const messagesData = data?.pages
    .flatMap((page) => page.data)
    .sort((a, b) => a.id - b.id);

  return (
    <div className="flex h-[calc(100%-5rem)] flex-col gap-2 overflow-y-scroll p-4">
      {messagesData && (
        <ul className="flex flex-col gap-2">
          {messagesData.map((msg) => (
            <MessageBalloon
              key={msg.id}
              messageData={msg}
              messageToEdit={messageToEdit}
              onEdit={onEdit}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
