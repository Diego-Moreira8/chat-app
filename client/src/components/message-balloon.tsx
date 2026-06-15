import type { MessageData } from "@chat-app/shared";
import { useRouteContext } from "@tanstack/react-router";
import { MessageContainer } from "./message-container";
import { MessageContent } from "./message-content";
import { MessageInfo } from "./message-info";
import { MessageMenu } from "./message-menu";

interface MessageBalloonProps {
  messageData: MessageData;
  messageToEdit: MessageData | null;
  onEdit: React.Dispatch<React.SetStateAction<MessageData | null>>;
}

export function MessageBalloon({
  messageData,
  messageToEdit,
  onEdit,
}: MessageBalloonProps) {
  const { userData } = useRouteContext({ from: "/_app" });

  const sentByCurrentUser =
    messageData.owner.username === userData.user.username;

  const isEditingCurrentMessage = messageToEdit?.id === messageData.id;

  return (
    <MessageContainer sentByCurrentUser={sentByCurrentUser}>
      {sentByCurrentUser && !messageData.deletedAt && (
        <MessageMenu
          isEditingCurrentMessage={isEditingCurrentMessage}
          messageData={messageData}
          onEdit={onEdit}
        />
      )}

      <div>
        <MessageInfo
          messageData={messageData}
          sentByCurrentUser={sentByCurrentUser}
        />

        <MessageContent messageData={messageData} />
      </div>
    </MessageContainer>
  );
}
