import request from "supertest";
import { app } from "../src/app";
import * as usersService from "../src/services/users";

vi.mock("../src/services/users", () => ({
  create: vi.fn(),
  findByUsername: vi.fn(),
  getWithCredentials: vi.fn(),
}));

afterEach(() => {
  vi.resetAllMocks();
});

const now = new Date();
const loginEndpoint = "/api/v1/auth/login";
const registerEndpoint = "/api/v1/auth/register";

describe(`POST ${loginEndpoint}`, () => {
  it("successful login", async () => {
    const username = "valid-username";
    const password = "12345678";
    const createdAt = now;

    vi.mocked(usersService.getWithCredentials).mockResolvedValueOnce({
      id: 1,
      username,
      createdAt,
    });

    const response = await request(app).post(loginEndpoint).send({
      username,
      password,
    });

    const cookies = response.headers["set-cookie"] as unknown as string[];

    expect(usersService.getWithCredentials).toHaveBeenCalledExactlyOnceWith({
      username,
      plainTextPassword: password,
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("auth.accessToken");
    expect(cookies).toBeDefined();
    expect(cookies.some((c) => c.startsWith("refreshToken="))).toBe(true);
  });

  it("responds with a 400 with invalid fields", async () => {
    // No body
    const response = await request(app).post(loginEndpoint);

    expect(usersService.getWithCredentials).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error.code", "VALIDATION_ERROR");
    expect(response.body).toHaveProperty("error.message");
    expect(response.body).toHaveProperty("error.details");
    expect(response.body).not.toHaveProperty("auth");
  });

  it("responds with a 401 with invalid credentials", async () => {
    const username = "username";
    const password = "password";

    vi.mocked(usersService.getWithCredentials).mockResolvedValueOnce(null);

    const response = await request(app).post(loginEndpoint).send({
      username,
      password,
    });

    expect(usersService.getWithCredentials).toHaveBeenCalledExactlyOnceWith({
      username,
      plainTextPassword: password,
    });
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error.code", "AUTH_ERROR");
    expect(response.body).toHaveProperty("error.message");
    expect(response.body).not.toHaveProperty("auth");
  });
});

describe(`POST ${registerEndpoint}`, () => {
  it("creates a valid user", async () => {
    const validUsername = "valid-username";
    const validPassword = "12345678";

    vi.mocked(usersService.findByUsername).mockResolvedValueOnce(null);

    vi.mocked(usersService.create).mockResolvedValueOnce({
      id: 1,
      username: validUsername,
      createdAt: now,
    });

    const response = await request(app).post(registerEndpoint).send({
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

  describe("responds with a 400 with invalid fields", () => {
    it("short username and password", async () => {
      const username = " ab  ";
      const password = "short";

      const response = await request(app).post(registerEndpoint).send({
        username: username,
        password: password,
      });

      expect(usersService.findByUsername).not.toHaveBeenCalled();
      expect(usersService.create).not.toHaveBeenCalled();
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error.code", "VALIDATION_ERROR");
      expect(response.body).toHaveProperty("error.message");
      expect(response.body).toHaveProperty("error.details");
      expect(response.body).not.toHaveProperty("user");
    });

    it("invalid username", async () => {
      const username = "user name";
      const password = "password";

      const response = await request(app).post(registerEndpoint).send({
        username: username,
        password: password,
      });

      expect(usersService.findByUsername).not.toHaveBeenCalled();
      expect(usersService.create).not.toHaveBeenCalled();
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error.code", "VALIDATION_ERROR");
      expect(response.body).toHaveProperty("error.message");
      expect(response.body).toHaveProperty("error.details");
      expect(response.body).not.toHaveProperty("user");
    });

    it("too long username and password", async () => {
      const username = "u".repeat(21);
      const password = "p".repeat(51);

      const response = await request(app).post(registerEndpoint).send({
        username,
        password,
      });

      expect(usersService.findByUsername).not.toHaveBeenCalled();
      expect(usersService.create).not.toHaveBeenCalled();
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error.code", "VALIDATION_ERROR");
      expect(response.body).toHaveProperty("error.message");
      expect(response.body).toHaveProperty("error.details");
      expect(response.body).not.toHaveProperty("user");
    });
  });

  it("responds with a 409 when a username already exists", async () => {
    const takenUsername = "username";
    const validPassword = "password";

    vi.mocked(usersService.findByUsername).mockResolvedValueOnce({
      id: 1,
      username: takenUsername,
      createdAt: now,
    });

    const response = await request(app).post(registerEndpoint).send({
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
