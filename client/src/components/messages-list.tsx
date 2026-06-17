import type { MessageDataResponse, MessageData } from "@chat-app/shared";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import type React from "react";
import { MessageBalloon } from "./message-balloon";
import { api } from "../api/instance";
import { useEffect, useRef } from "react";

interface MessagesListProps {
  messageToEdit: MessageData | null;
  shouldScrollDown: React.RefObject<boolean>;
  onEdit: React.Dispatch<React.SetStateAction<MessageData | null>>;
}

export function MessagesList({
  messageToEdit,
  shouldScrollDown,
  onEdit,
}: MessagesListProps) {
  const messageListContainerRef = useRef<HTMLDivElement | null>(null);
  const isFirstLoad = useRef(true);
  const lastData = useRef<MessageData[] | null>(null);

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

  /**
   * Scroll to last message when data changes and
   * shouldScrollDown was changed to true.
   */
  useEffect(() => {
    const container = messageListContainerRef.current;
    const dataChanged = lastData.current !== messagesData;

    if (isFirstLoad.current || dataChanged) {
      shouldScrollDown.current = true;
    }

    if (!container || !data || !shouldScrollDown.current) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: isFirstLoad.current ? "instant" : "smooth",
    });

    if (isFirstLoad.current) isFirstLoad.current = false;
    lastData.current = messagesData || null;
    shouldScrollDown.current = false;
  }, [data]);

  return (
    <div
      className="flex h-[calc(100%-5rem)] flex-col gap-2 overflow-y-scroll p-4"
      ref={messageListContainerRef}
    >
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
