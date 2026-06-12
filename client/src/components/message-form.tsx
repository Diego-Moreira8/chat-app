import {
  CreateMessageBody,
  type MessageData,
  type MessageDataResponse,
} from "@chat-app/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { api } from "../api/instance";

interface MessageFormProps {
  messageToEdit: MessageData | null;
  onSubmitMessageChanges: (newData: MessageData) => void;
  updateMessageStatus: "error" | "idle" | "pending" | "success";
}

export function MessageForm({
  messageToEdit,
  onSubmitMessageChanges,
  updateMessageStatus,
}: MessageFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    resetField,
    setError,
    setValue,
  } = useForm({
    resolver: zodResolver(CreateMessageBody),
  });

  const { queryClient } = useRouteContext({ from: "/_app" });

  const newMessageMutation = useMutation({
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

  useEffect(() => {
    setValue("content", messageToEdit?.content || "");
  }, [setValue, messageToEdit]);

  return (
    <form
      onSubmit={handleSubmit(({ content }) => {
        if (messageToEdit) {
          onSubmitMessageChanges({
            ...messageToEdit,
            content,
          });

          return;
        }

        newMessageMutation.mutateAsync({ content });
      })}
    >
      <p>{errors.form?.message || errors.content?.message}</p>

      <label htmlFor="message">
        {messageToEdit ? "Editando mensagem" : "Nova mensagem"}
      </label>
      <input
        autoFocus
        id="message"
        type="text"
        {...register("content", {
          disabled: newMessageMutation.isPending,
        })}
      />

      <button
        type="submit"
        disabled={
          newMessageMutation.isPending || updateMessageStatus === "pending"
        }
      >
        {messageToEdit &&
          (updateMessageStatus === "pending"
            ? "Salvando alterações..."
            : "Salvar alterações")}

        {!messageToEdit &&
          (newMessageMutation.isPending ? "Enviando..." : "Enviar")}
      </button>
    </form>
  );
}
