import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../src/app";
import * as usersService from "../src/services/users";

vi.mock("../src/services/users", () => ({
  findById: vi.fn(),
}));

vi.mock("../src/config/env", () => ({
  env: {
    jwtSecret: "test-secret-key",
  },
}));

afterEach(() => {
  vi.resetAllMocks();
});

const meEndpoint = "/api/v1/users/me";
const now = new Date();

describe(`GET ${meEndpoint}`, () => {
  it("responds with 401 when no authorization header", async () => {
    const response = await request(app).get(meEndpoint);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error");
    expect(response.body).toHaveProperty("message");
  });

  it("responds with user data when authenticated and user exists", async () => {
    const userId = 1;
    const token = jwt.sign({ sub: userId }, "test-secret-key", {
      expiresIn: "15min",
    });
    const userData = {
      id: userId,
      username: "test-user",
      createdAt: now,
    };

    vi.mocked(usersService.findById).mockResolvedValueOnce(userData);

    const response = await request(app)
      .get(meEndpoint)
      .set("Authorization", `Bearer ${token}`);

    expect(usersService.findById).toHaveBeenCalledExactlyOnceWith(userId);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      user: {
        ...userData,
        createdAt: userData.createdAt.toISOString(),
      },
    });
  });

  it("responds with 404 when authenticated but user not found", async () => {
    const userId = 999;
    const token = jwt.sign({ sub: userId.toString() }, "test-secret-key");

    vi.mocked(usersService.findById).mockResolvedValueOnce(null);

    const response = await request(app)
      .get(meEndpoint)
      .set("Authorization", `Bearer ${token}`);

    expect(usersService.findById).toHaveBeenCalledExactlyOnceWith(userId);
    expect(response.status).toBe(404);
  });

  it("responds with 401 when token is invalid", async () => {
    const response = await request(app)
      .get(meEndpoint)
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error");
  });
});
