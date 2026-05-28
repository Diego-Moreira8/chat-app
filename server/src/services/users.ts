import { prisma } from "@chat-app/shared/prisma";
import bcrypt from "bcrypt";

interface CreateUserPayload {
  username: string;
  plainTextPassword: string;
}

interface LoginPayload {
  username: string;
  plainTextPassword: string;
}

const BCRYPT_SALT_ROUNDS = 10;

export const create = async ({
  username,
  plainTextPassword,
}: CreateUserPayload) => {
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

export const getWithCredentials = async ({
  username,
  plainTextPassword,
}: LoginPayload) => {
  const userData = await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
      username: true,
      passwordHash: true,
      createdAt: true,
    },
  });

  if (!userData) return null;

  const passwordsMatch = await bcrypt.compare(
    plainTextPassword,
    userData.passwordHash,
  );

  if (passwordsMatch) {
    const { id, username, createdAt } = userData;
    return { id, username, createdAt };
  }

  return null;
};
