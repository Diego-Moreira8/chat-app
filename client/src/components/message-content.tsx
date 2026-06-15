import type { MessageData } from "@chat-app/shared";
import { Trash2 } from "lucide-react";

interface MessageContentProps {
  messageData: MessageData;
}

export function MessageContent({ messageData }: MessageContentProps) {
  const { content, deletedAt } = messageData;

  return (
    <p className="wrap-anywhere">
      {deletedAt ? (
        <span className="inline-flex items-center gap-1 italic">
          <Trash2 className="h-4 w-fit" /> <span>Mensagem apagada</span>
        </span>
      ) : (
        content
      )}
    </p>
  );
}
