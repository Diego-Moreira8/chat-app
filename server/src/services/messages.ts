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
    select: {
      id: true,
      content: true,
      createdAt: true,
      owner: {
        select: {
          username: true,
        },
      },
    },
  });

  return newMessage;
};

export const get = async () => {
  const messages = await prisma.message.findMany({
    select: {
      id: true,
      content: true,
      createdAt: true,
      owner: {
        select: {
          username: true,
        },
      },
    },
  });

  return messages;
};
