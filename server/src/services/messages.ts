import { prisma } from "@chat-app/shared/prisma";

interface NewMessagePayload {
  content: string;
  ownerId: number;
}

export const create = async ({ ownerId, content }: NewMessagePayload) => {
  const newMessage = await prisma.message.create({
    data: {
      ownerId,
      content,
    },
  });

  return newMessage;
};
