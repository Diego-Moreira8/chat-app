import {
  CreateMessageBody,
  type MessageData,
  type MessageDataResponse,
} from "@chat-app/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import cn from "classnames";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { api } from "../api/instance";
import { LoaderCircle, SendHorizontal } from "lucide-react";

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
  const { handleSubmit, register, resetField, setError, setValue } = useForm({
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

  const isPending =
    newMessageMutation.isPending || updateMessageStatus === "pending";

  useEffect(() => {
    setValue("content", messageToEdit?.content || "");
  }, [setValue, messageToEdit]);

  return (
    <div className="flex h-20 items-center justify-center px-2">
      <form
        className="flex w-full gap-1 rounded-full border-3 border-black bg-white p-2 shadow-xl/20 dark:border-white dark:bg-black"
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
        <input
          className="h-10 grow rounded-full border-2 border-black px-4 inset-shadow-sm outline-none placeholder:italic dark:border-white"
          autoComplete="off"
          placeholder="Digite uma mensagem aqui"
          autoFocus
          type="text"
          {...register("content", {
            disabled: newMessageMutation.isPending,
          })}
        />

        <button
          className={cn(
            "flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-cyan-700 text-white shadow transition-colors hover:bg-cyan-600 focus:bg-cyan-600 active:bg-cyan-800",
            isPending && "pointer-events-none opacity-50",
          )}
          type="submit"
          disabled={isPending}
        >
          {isPending ? (
            <LoaderCircle className="size-6 animate-spin" />
          ) : (
            <SendHorizontal className="h-6 w-fit" />
          )}
        </button>
      </form>
    </div>
  );
}
