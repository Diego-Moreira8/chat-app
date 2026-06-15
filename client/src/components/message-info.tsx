import type { MessageData } from "@chat-app/shared";

interface MessageInfoProps {
  messageData: MessageData;
  sentByCurrentUser: boolean;
}

export function MessageInfo({
  messageData,
  sentByCurrentUser,
}: MessageInfoProps) {
  const { createdAt, updatedAt, deletedAt, owner } = messageData;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <span className="text-xs font-light italic">
      <span className="font-medium">
        {sentByCurrentUser ? "Você" : owner.username}
      </span>{" "}
      em {formatDate(new Date(createdAt))}{" "}
      {updatedAt && !deletedAt && "(editada)"}
    </span>
  );
}
