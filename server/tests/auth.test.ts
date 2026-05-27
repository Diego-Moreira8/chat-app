import request from "supertest";
import { app } from "../src/app";
import * as usersService from "../src/services/users";

vi.mock("../src/services/users", () => ({
  create: vi.fn(),
}));

const endpoint = "/api/v1/auth/register";

describe(`POST ${endpoint}`, () => {
  const now = new Date();

  test("creates a valid user", async () => {
    const validUsername = "valid-username";
    const validPassword = "12345678";

    vi.mocked(usersService.create).mockResolvedValueOnce({
      id: 1,
      username: validUsername,
      createdAt: now,
    });

    const response = await request(app).post(endpoint).send({
      username: validUsername,
      password: validPassword,
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      user: {
        id: 1,
        username: validUsername,
        createdAt: now.toJSON(),
        // No password or password hash
      },
    });
  });

  test("responds with a 400 with invalid fields", async () => {
    const invalidUsername = " -_  ";
    const invalidPassword = "short";

    const response = await request(app).post(endpoint).send({
      username: invalidUsername,
      password: invalidPassword,
    });

    expect(usersService.create).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(response.body).not.toHaveProperty("user");
  });

  test("responds with a 409 when a username already exists", { todo: true });
});
