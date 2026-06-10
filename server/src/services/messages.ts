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

interface Options {
  withUserId?: boolean;
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

export const deleteMessage = async (id: number) => {
  const deletedMessage = await prisma.message.delete({
    where: { id },
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

  return deletedMessage;
};

export const findById = async (id: number, options?: Options) => {
  const messageFound = await prisma.message.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      owner: {
        select: {
          id: Boolean(options?.withUserId),
          username: true,
        },
      },
    },
  });

  return messageFound;
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
