import { CreateMessageBody, type MessageDataResponse } from "@chat-app/shared";
import { useMutation } from "@tanstack/react-query";
import { api } from "../api/instance";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouteContext } from "@tanstack/react-router";

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

  const { queryClient } = useRouteContext({ from: "/_app" });

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async ({ content }: CreateMessageBody) => {
      const accessToken = queryClient.getQueryData<string>([
        "user",
        "accessToken",
      ]);

      const response = await api.post<MessageDataResponse>(
        "/api/v1/messages",
        { content },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
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
    <form onSubmit={handleSubmit(({ content }) => mutateAsync({ content }))}>
      <p>{errors.form?.message || errors.content?.message}</p>

      <input
        autoFocus
        type="text"
        disabled={isPending}
        {...register("content")}
      />

      <button type="submit" disabled={isPending}>
        {isPending ? "Enviando..." : "Enviar"}
      </button>
    </form>
  );
}
