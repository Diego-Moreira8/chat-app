import { prisma } from "@chat-app/shared/prisma";
import * as msgsService from "../services/messages";

vi.mock("@chat-app/shared/prisma", () => ({
  prisma: {
    message: {
      create: vi.fn(),
    },
  },
}));

afterEach(() => {
  vi.resetAllMocks();
});

it("creates a new message and return the correct object", async () => {
  const validContent = "Hello, World!";

  await msgsService.create({
    ownerId: 1,
    content: validContent,
  });

  expect(prisma.message.create).toHaveBeenCalledExactlyOnceWith({
    data: {
      ownerId: 1,
      content: validContent,
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
});
