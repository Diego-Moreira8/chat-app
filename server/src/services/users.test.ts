import { prisma } from "@chat-app/shared/prisma";
import bcrypt from "bcrypt";
import * as usersService from "../services/users";

vi.mock("@chat-app/shared/prisma", () => ({
  prisma: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
  },
}));

test("create a new user and return it's data without the passwordHash", async () => {
  const testUsername = "username";
  const testPassword = "password";
  const hashedPassword = "hashed_password";

  vi.mocked(bcrypt.hash).mockImplementationOnce(() =>
    Promise.resolve("hashed_password"),
  );

  await usersService.create({
    username: testUsername,
    plainTextPassword: testPassword,
  });

  expect(bcrypt.hash).toHaveBeenCalledExactlyOnceWith(testPassword, 10);

  expect(prisma.user.create).toHaveBeenCalledExactlyOnceWith({
    data: {
      username: testUsername,
      passwordHash: hashedPassword,
    },
    select: {
      id: true,
      username: true,
      passwordHash: false,
      createdAt: true,
    },
  });
});

test("find user by username and not return it's passwordHash", async () => {
  const testUsername = "username";

  await usersService.findByUsername(testUsername);

  expect(prisma.user.findUnique).toHaveBeenCalledExactlyOnceWith({
    where: {
      username: testUsername,
    },
    select: {
      id: true,
      username: true,
      passwordHash: false,
      createdAt: true,
    },
  });
});
