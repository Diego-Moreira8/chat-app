import request from "supertest";
import { app } from "../src/app";

describe("GET /non-existing-route", () => {
  test("responds with a 404", async () => {
    const response = await request(app).get("/non-existing-route");

    expect(response.statusCode).toBe(404);
  });
});
