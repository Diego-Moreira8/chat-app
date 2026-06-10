import { CreateMessageBody, type MessageDataResponse } from "@chat-app/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/instance";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function MessageForm() {
  const {
    handleSubmit,
    register,
    resetField,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CreateMessageBody),
  });

  const queryClient = useQueryClient();

  const messagesMutation = useMutation({
    mutationFn: async ({ content }: CreateMessageBody) => {
      const accessToken = queryClient.getQueryData<string>([
        "user",
        "accessToken",
      ]);

      if (!accessToken) {
        throw new Error("No access token on query data");
      }

      const response = await api.post<MessageDataResponse>(
        "/api/v1/messages",
        { content },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      return response.data;
    },
    onSuccess: () => {
      resetField("content");
    },
    onError: () => {
      setError("form", {
        message:
          "Houve um erro interno ao enviar sua mensagem! Recarregue a página e tente novamente.",
      });
    },
  });

  return (
    <form
      onSubmit={handleSubmit(({ content }) =>
        messagesMutation.mutateAsync({ content }),
      )}
    >
      <p>{errors.form?.message || errors.content?.message}</p>

      <input
        autoFocus
        type="text"
        disabled={messagesMutation.isPending}
        {...register("content")}
      />

      <button type="submit" disabled={messagesMutation.isPending}>
        {messagesMutation.isPending ? "Enviando..." : "Enviar"}
      </button>
    </form>
  );
}
