import jwt from "jsonwebtoken";
import request from "supertest";
import { app } from "../src/app";
import * as msgsService from "../src/services/messages";

vi.mock("../src/services/messages", () => ({
  create: vi.fn(),
}));

vi.mock("../src/config/env", () => ({
  env: {
    jwtSecret: "test-secret-key",
  },
}));

afterEach(() => {
  vi.resetAllMocks();
});

const messagesEndpoint = "/api/v1/messages";

describe(`POST ${messagesEndpoint}`, () => {
  it("creates a message when authenticated and request body is valid", async () => {
    const ownerId = 1;
    const token = jwt.sign({ sub: ownerId }, "test-secret-key", {
      expiresIn: "15min",
    });

    const createdAt = new Date();
    const message = {
      id: 10,
      content: "Hello world",
      createdAt,
      owner: {
        username: "test-user",
      },
    };

    vi.mocked(msgsService.create).mockResolvedValueOnce(message);

    const response = await request(app)
      .post(messagesEndpoint)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: message.content });

    expect(msgsService.create).toHaveBeenCalledExactlyOnceWith({
      ownerId,
      content: message.content,
    });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: [{ ...message, createdAt: createdAt.toISOString() }],
    });
  });

  it("responds with 400 when the request body is invalid", async () => {
    const ownerId = 1;
    const token = jwt.sign({ sub: ownerId }, "test-secret-key", {
      expiresIn: "15min",
    });

    const response = await request(app)
      .post(messagesEndpoint)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "" });

    expect(msgsService.create).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error.code", "VALIDATION_ERROR");
    expect(response.body).toHaveProperty("error.message");
    expect(response.body).toHaveProperty("error.details");
  });

  it("responds with 401 when no authorization header is provided", async () => {
    const response = await request(app)
      .post(messagesEndpoint)
      .send({ content: "Hello world" });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error.code");
    expect(response.body).toHaveProperty("error.message");
  });

  it("responds with 401 when the authorization token is invalid", async () => {
    const response = await request(app)
      .post(messagesEndpoint)
      .set("Authorization", "Bearer invalid-token")
      .send({ content: "Hello world" });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error.code");
    expect(response.body).toHaveProperty("error.message");
  });
});
