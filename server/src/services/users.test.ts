import { prisma } from "@chat-app/shared";
import bcrypt from "bcrypt";
import * as usersService from "../services/users";

vi.mock("@chat-app/shared", () => ({
  prisma: {
    user: {
      create: vi.fn(),
    },
  },
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
  },
}));

test("create a new user and return it's data without the passwordHash", async () => {
  const now = new Date();

  vi.mocked(prisma.user.create).mockImplementationOnce(
    () =>
      ({
        id: 1,
        username: "test_username",
        createdAt: now,
      }) as any,
  );

  vi.mocked(bcrypt.hash).mockImplementationOnce(() =>
    Promise.resolve("hashed_password"),
  );

  const newUser = await usersService.create({
    username: "test_username",
    plainTextPassword: "plain_text_password",
  });

  expect(bcrypt.hash).toHaveBeenCalledExactlyOnceWith(
    "plain_text_password",
    10,
  );

  expect(prisma.user.create).toHaveBeenCalledExactlyOnceWith({
    data: {
      username: "test_username",
      passwordHash: "hashed_password",
    },
    select: {
      id: true,
      username: true,
      passwordHash: false,
      createdAt: true,
    },
  });

  expect(newUser).toEqual({
    id: 1,
    username: "test_username",
    createdAt: now,
  });
});
