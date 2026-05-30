import request from "supertest";
import { app } from "../src/app";

describe("GET /", () => {
  let response: request.Response;

  beforeAll(async () => {
    response = await request(app).get("/");
  });

  it("responds with 200 status code", () => {
    expect(response.status).toBe(200);
  });

  it("responds with a json containing a message key", () => {
    expect(response.body).toHaveProperty(
      "message",
      expect.stringContaining("Hello, World! "),
    );
  });
});
