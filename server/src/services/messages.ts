import { prisma } from "@chat-app/shared/prisma";

interface NewMessagePayload {
  content: string;
  ownerId: number;
}

interface GetMessagesQuery {
  cursor?: number;
  skip: number;
  take: number;
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

export const getDescending = async ({
  cursor,
  skip,
  take,
}: GetMessagesQuery) => {
  const messages = await prisma.message.findMany({
    ...(cursor && { cursor: { id: cursor } }),
    ...(cursor && { skip }),
    take,
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
    orderBy: { id: "desc" },
  });

  return messages;
};
