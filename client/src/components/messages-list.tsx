import type { MessageDataResponse } from "@chat-app/shared";
import { useQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { api } from "../api/instance";

export function MessagesList() {
  const { queryClient } = useRouteContext({ from: "/_app" });

  const { data, isLoading, isRefetching, isError } = useQuery({
    queryKey: ["messages"],
    staleTime: 5000,
    refetchInterval: 5000,
    queryFn: async () => {
      const accessToken = queryClient.getQueryData<string>([
        "user",
        "accessToken",
      ]);

      const response = await api.get<MessageDataResponse>("/api/v1/messages", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return response.data;
    },
  });

  const messagesData = data?.data
    .map((msg) => ({
      ...msg,
      createdAt: new Date(msg.createdAt),
    }))
    .sort((a, b) => {
      if (a.createdAt < b.createdAt) return 1;
      if (a.createdAt > b.createdAt) return -1;
      return 0;
    })
    .map((msg) => ({
      ...msg,
      createdAt: msg.createdAt.toLocaleDateString("pt-BR", {
        year: "2-digit",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    }));

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
                  <b>{msg.owner.username}</b> em {msg.createdAt}
                </i>
              </p>

              <p>{msg.content}</p>

              <hr />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
