import type { MessageDataResponse, MessageData } from "@chat-app/shared";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import cn from "classnames";
import { api } from "../api/instance";
import { LoaderCircle, Pencil, Trash2 } from "lucide-react";

interface MessagesListProps {
  messageToEdit: MessageData | null;
  onEdit: React.Dispatch<React.SetStateAction<MessageData | null>>;
}

interface MessageProps {
  messageData: MessageData;
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
    .flatMap((page) => page.data.map((msg) => ({ ...msg })))
    .sort((a, b) => a.id - b.id);

  return (
    <div className="flex h-[calc(100%-5rem)] flex-col gap-2 overflow-y-scroll p-4">
      {messagesData && (
        <ul className="flex flex-col gap-2">
          {messagesData.map((msg) => (
            <Message
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

function Message({ messageData, messageToEdit, onEdit }: MessageProps) {
  const { id, content, createdAt, updatedAt, deletedAt, owner } = messageData;
  const isEditingCurrentMessage = messageToEdit?.id === messageData.id;

  const { queryClient, userData } = useRouteContext({ from: "/_app" });

  const deleteMessageMutation = useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const accessToken = queryClient.getQueryData<string>([
        "user",
        "accessToken",
      ]);

      const response = await api.delete(`/api/v1/messages/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      if (isEditingCurrentMessage) onEdit(null);
    },
    onError: () => {
      // TODO
    },
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const sentByCurrentUser = owner.username === userData.user.username;

  return (
    <li
      className={cn(
        "flex w-fit gap-2 rounded-lg border-2 border-black px-4 py-2",
        sentByCurrentUser
          ? "self-end rounded-br-none bg-cyan-600 text-right text-white"
          : "rounded-tl-none bg-white text-left",
      )}
    >
      {/* Options */}
      {sentByCurrentUser && !deletedAt && (
        <div className="flex h-full items-center gap-1 text-black">
          <button
            className="flex size-6 cursor-pointer items-center justify-center rounded-full bg-white shadow hover:bg-sky-100 focus:bg-sky-100 active:bg-sky-800 active:text-white"
            onClick={() => deleteMessageMutation.mutateAsync({ id })}
            type="button"
            disabled={deleteMessageMutation.isPending}
          >
            {deleteMessageMutation.isPending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Trash2 className="h-4" />
            )}
          </button>

          <button
            className={cn(
              "flex size-6 cursor-pointer items-center justify-center rounded-full bg-white shadow hover:bg-sky-100 focus:bg-sky-100 active:bg-sky-800 active:text-white",
              isEditingCurrentMessage && "pointer-events-none opacity-50",
            )}
            onClick={() => onEdit(messageData)}
            type="button"
            disabled={isEditingCurrentMessage}
          >
            <Pencil className="h-4" />
          </button>
        </div>
      )}

      <div>
        {/* Info */}
        <span className="text-xs font-light italic">
          <span className="font-medium">
            {sentByCurrentUser ? "Você" : owner.username}
          </span>{" "}
          em {formatDate(new Date(createdAt))}{" "}
          {updatedAt && !deletedAt && "(editada)"}
        </span>

        {/* Content */}
        <p>{deletedAt ? <i>[Mensagem apagada]</i> : content}</p>
      </div>
    </li>
  );
}
