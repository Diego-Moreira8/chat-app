import type { MessageDataResponse } from "@chat-app/shared";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { api } from "../api/instance";

export function MessagesList() {
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
    <>
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
            <li key={msg.id}>
              <p>
                <i>
                  {msg.id} <b>{msg.owner.username}</b> em {msg.createdAt}
                </i>
              </p>

              <p>{msg.content}</p>

              <hr />
            </li>
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
    </>
  );
}
