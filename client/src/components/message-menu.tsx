import type { MessageData } from "@chat-app/shared";
import { useMutation } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import cn from "classnames";
import { LoaderCircle, Pencil, Trash2 } from "lucide-react";
import { api } from "../api/instance";

interface MessageMenuProps {
  isEditingCurrentMessage: boolean;
  messageData: MessageData;
  onEdit: React.Dispatch<React.SetStateAction<MessageData | null>>;
}

export function MessageMenu({
  isEditingCurrentMessage,
  messageData,
  onEdit,
}: MessageMenuProps) {
  const { queryClient } = useRouteContext({ from: "/_app" });

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
    <div className="flex h-full items-center gap-1 text-black dark:text-white">
      <button
        className={cn(
          "flex size-6 cursor-pointer items-center justify-center rounded-full shadow",
          "active:text-white",
          "bg-white dark:bg-black",
          "hover:bg-red-200 dark:hover:bg-red-800",
          "focus:bg-red-200 dark:focus:bg-red-800",
          "active:bg-red-300 dark:active:bg-red-900",
          deleteMessageMutation.isPending && "pointer-events-none opacity-50",
        )}
        onClick={() =>
          deleteMessageMutation.mutateAsync({ id: messageData.id })
        }
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
          "flex size-6 cursor-pointer items-center justify-center rounded-full shadow",
          "active:text-white",
          "bg-white dark:bg-black",
          "hover:bg-sky-200 dark:hover:bg-sky-900",
          "focus:bg-sky-200 dark:focus:bg-sky-900",
          "active:bg-sky-300 dark:active:bg-sky-950",
          isEditingCurrentMessage && "pointer-events-none opacity-50",
        )}
        onClick={() => onEdit(messageData)}
        type="button"
        disabled={isEditingCurrentMessage}
      >
        <Pencil className="h-4" />
      </button>
    </div>
  );
}
