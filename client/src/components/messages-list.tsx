import type { MessageDataResponse, MessageData } from "@chat-app/shared";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { api } from "../api/instance";

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

  const {
    data,
    isLoading,
    isRefetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isError,
  } = useInfiniteQuery({
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

  const messagesData = data?.pages.flatMap((page) =>
    page.data.map((msg) => ({
      ...msg,
      createdAt: new Date(msg.createdAt).toLocaleDateString("pt-BR", {
        year: "2-digit",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    })),
  );

  return (
    <div className="grow">
      <p>
        {isRefetching
          ? "⌛ Atualizando mensagens..."
          : "✅ Aguardando para atualizar mensagens"}
      </p>

      {isError && <p>❌ Houve um erro ao carregar as mensagens!</p>}

      {isLoading && <p>⌛ Carregando mensagens...</p>}

      {messagesData && (
        <ul>
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

      <button
        onClick={() => fetchNextPage()}
        type="button"
        disabled={isFetchingNextPage || !hasNextPage}
      >
        Carregar mais
      </button>

      {isFetchingNextPage && <span>⌛ Carregando próxima página...</span>}
      {!hasNextPage && <span>✅ Não há mais mensagens</span>}
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

  return (
    <li>
      <p>
        <i>
          #{id} <b>{owner.username}</b> em {createdAt}{" "}
          {updatedAt && !deletedAt && "(editada)"}
        </i>
      </p>

      <p>{deletedAt ? <i>[Mensagem apagada]</i> : content}</p>

      {owner.username === userData.user.username && !deletedAt && (
        <div>
          <span>Opções: </span>

          <button
            onClick={() => deleteMessageMutation.mutateAsync({ id })}
            type="button"
            disabled={deleteMessageMutation.isPending}
          >
            {deleteMessageMutation.isPending ? "⌛ Apagando..." : "Apagar"}
          </button>

          <button
            onClick={() => onEdit(messageData)}
            type="button"
            disabled={isEditingCurrentMessage}
          >
            {isEditingCurrentMessage ? "Editando" : "Editar"}
          </button>
        </div>
      )}

      <hr />
    </li>
  );
}
