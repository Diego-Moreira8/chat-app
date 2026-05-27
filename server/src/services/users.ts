import { prisma } from "@chat-app/shared";
import bcrypt from "bcrypt";

interface NewUserPayload {
  username: string;
  plainTextPassword: string;
}

const BCRYPT_SALT_ROUNDS = 10;

export const create = async ({
  username,
  plainTextPassword,
}: NewUserPayload) => {
  const passwordHash = await bcrypt.hash(plainTextPassword, BCRYPT_SALT_ROUNDS);
  const newUser = await prisma.user.create({
    data: {
      username: username,
      passwordHash: passwordHash,
    },
    select: {
      id: true,
      username: true,
      passwordHash: false,
      createdAt: true,
    },
  });

  return newUser;
};

export const findByUsername = async (username: string) => {
  const userFound = await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
      username: true,
      passwordHash: false,
      createdAt: true,
    },
  });

  return userFound;
};
