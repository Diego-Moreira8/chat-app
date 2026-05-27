import request from "supertest";
import { app } from "../src/app";
import * as usersService from "../src/services/users";

vi.mock("../src/services/users", () => ({
  create: vi.fn(),
  findByUsername: vi.fn(),
}));

afterEach(() => {
  vi.resetAllMocks();
});

const now = new Date();
const endpoint = "/api/v1/auth/register";

describe(`POST ${endpoint}`, () => {
  test("creates a valid user", async () => {
    const validUsername = "valid-username";
    const validPassword = "12345678";

    vi.mocked(usersService.findByUsername).mockResolvedValueOnce(null);

    vi.mocked(usersService.create).mockResolvedValueOnce({
      id: 1,
      username: validUsername,
      createdAt: now,
    });

    const response = await request(app).post(endpoint).send({
      username: validUsername,
      password: validPassword,
    });

    expect(usersService.findByUsername).toHaveBeenCalledExactlyOnceWith(
      validUsername,
    );
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
    const invalidUsername = " a_  ";
    const invalidPassword = "short";

    const response = await request(app).post(endpoint).send({
      username: invalidUsername,
      password: invalidPassword,
    });

    expect(usersService.findByUsername).not.toHaveBeenCalled();
    expect(usersService.create).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error.code", "VALIDATION_ERROR");
    expect(response.body).toHaveProperty("error.message");
    expect(response.body).toHaveProperty("error.details");
    expect(response.body).not.toHaveProperty("user");
  });

  test("responds with a 409 when a username already exists", async () => {
    const takenUsername = "username";
    const validPassword = "password";

    vi.mocked(usersService.findByUsername).mockResolvedValueOnce({
      id: 1,
      username: takenUsername,
      createdAt: now,
    });

    const response = await request(app).post(endpoint).send({
      username: takenUsername,
      password: validPassword,
    });

    expect(usersService.findByUsername).toHaveBeenCalledExactlyOnceWith(
      takenUsername,
    );
    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("error.code", "USERNAME_TAKEN");
    expect(response.body).toHaveProperty("error.message");
    expect(response.body).not.toHaveProperty("user");
  });
});
