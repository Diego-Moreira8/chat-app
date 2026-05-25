import request from "supertest";
import { app } from "../src/app";
import * as usersService from "../src/services/users";

vi.mock("../src/services/users", () => ({
  create: vi.fn(),
}));

describe("POST /api/v1/auth/register", () => {
  const now = new Date();
  let response: request.Response;

  beforeAll(async () => {
    vi.mocked(usersService.create).mockResolvedValueOnce({
      id: 1,
      username: "test_username",
      createdAt: now,
    });

    response = await request(app).post("/api/v1/auth/register").send({
      username: "test_username",
      password: "plain_text_password",
    });
  });

  test("responds with 201 status code", () => {
    expect(response.status).toBe(201);
  });

  test("responds with a JSON containing the new user data without its password", () => {
    expect(response.body).toEqual({
      user: {
        id: 1,
        username: "test_username",
        createdAt: now.toJSON(),
      },
    });
  });
});
