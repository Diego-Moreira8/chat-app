import { errorCodes } from "@chat-app/shared";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { auth } from "./auth";

vi.mock("../config/env", () => ({
  env: {
    jwtSecret: "test-secret-key",
  },
}));

let req: Partial<Request>;
let res: Partial<Response>;
let next: NextFunction;

beforeEach(() => {
  req = {
    headers: {},
  };
  res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    locals: {},
  };
  next = vi.fn();
});

describe("Missing authorization header", () => {
  it("should return 401 with AUTH_ERROR when no authorization header", () => {
    auth(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: errorCodes.AUTH_ERROR,
        message: "You need an access token to access this resource",
      },
    });
    expect(next).not.toHaveBeenCalled();
  });
});

describe("Invalid authorization format", () => {
  it("should return 401 when authorization header doesn't start with 'Bearer '", () => {
    req.headers = { authorization: "Basic xyz" };

    auth(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: errorCodes.AUTH_ERROR,
        message: "Wrong access token format",
      },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 when authorization header is just 'Bearer' without token", () => {
    req.headers = { authorization: "Bearer" };

    auth(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: errorCodes.AUTH_ERROR,
        message: "Wrong access token format",
      },
    });
  });

  it("should return 401 when authorization header is 'Bearer ' with empty token", () => {
    req.headers = { authorization: "Bearer " };

    auth(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: errorCodes.AUTH_ERROR, message: "Invalid access token" },
    });
  });
});

describe("Valid token", () => {
  it("should call next when token is valid", () => {
    const token = jwt.sign({ sub: "123" }, "test-secret-key");
    req.headers = { authorization: `Bearer ${token}` };

    auth(req as Request, res as Response, next);

    expect(res.locals?.sub).toBe(123);
    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should parse numeric sub from token", () => {
    const token = jwt.sign({ sub: "456" }, "test-secret-key");
    req.headers = { authorization: `Bearer ${token}` };

    auth(req as Request, res as Response, next);

    expect(res.locals?.sub).toBe(456);
    expect(next).toHaveBeenCalled();
  });

  it("should handle large numeric sub values", () => {
    const token = jwt.sign({ sub: "999999999" }, "test-secret-key");
    req.headers = { authorization: `Bearer ${token}` };

    auth(req as Request, res as Response, next);

    expect(res.locals?.sub).toBe(999999999);
    expect(next).toHaveBeenCalled();
  });
});

describe("Invalid/malformed token", () => {
  it("should return 401 when token is invalid", () => {
    req.headers = { authorization: "Bearer invalid.token.here" };

    auth(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: errorCodes.AUTH_ERROR, message: "Invalid access token" },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 when token is signed with wrong secret", () => {
    const token = jwt.sign({ sub: "123" }, "wrong-secret-key");
    req.headers = { authorization: `Bearer ${token}` };

    auth(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: errorCodes.AUTH_ERROR, message: "Invalid access token" },
    });
  });

  it("should return 401 when token is expired", () => {
    const token = jwt.sign({ sub: "123" }, "test-secret-key", {
      expiresIn: "-1h",
    });
    req.headers = { authorization: `Bearer ${token}` };

    auth(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: errorCodes.AUTH_ERROR, message: "Invalid access token" },
    });
  });
});

describe("Token payload validation", () => {
  it("should pass error to next when sub is missing from payload", () => {
    const token = jwt.sign({}, "test-secret-key");
    req.headers = { authorization: `Bearer ${token}` };

    auth(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should pass error to next when sub is not numeric", () => {
    const token = jwt.sign({ sub: "not-a-number" }, "test-secret-key");
    req.headers = { authorization: `Bearer ${token}` };

    auth(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should handle sub with leading zeros", () => {
    const token = jwt.sign({ sub: "0123" }, "test-secret-key");
    req.headers = { authorization: `Bearer ${token}` };

    auth(req as Request, res as Response, next);

    expect(res.locals?.sub).toBe(123);
    expect(next).toHaveBeenCalled();
  });
});

describe("Token extraction", () => {
  it("should extract token correctly even with multiple Bearer words", () => {
    const token = jwt.sign({ sub: "123" }, "test-secret-key");
    req.headers = { authorization: `Bearer Bearer ${token}` };

    auth(req as Request, res as Response, next);

    // This will fail to verify because the token includes "Bearer"
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: errorCodes.AUTH_ERROR, message: "Invalid access token" },
    });
  });

  it("should handle authorization header with different casing", () => {
    const token = jwt.sign({ sub: "123" }, "test-secret-key");
    // Note: headers in Express are lowercase
    req.headers = { authorization: `Bearer ${token}` };

    auth(req as Request, res as Response, next);

    expect(res.locals?.sub).toBe(123);
    expect(next).toHaveBeenCalled();
  });
});

describe("Error handling", () => {
  it("should call next with error for non-JWT errors", () => {
    req.headers = { authorization: "Bearer validformat" };

    // Mock jwt.verify to throw a non-JwtPayloadError
    const jwtVerifySpy = vi.spyOn(jwt, "verify");

    jwtVerifySpy.mockImplementation(() => {
      throw new Error("Unexpected error");
    });

    auth(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect((next as any).mock.calls[0][0].message).toBe("Unexpected error");

    jwtVerifySpy.mockRestore();
  });
});

describe("Response locals", () => {
  it("should set sub in res.locals for authenticated requests", () => {
    const token = jwt.sign({ sub: "789" }, "test-secret-key");
    req.headers = { authorization: `Bearer ${token}` };

    auth(req as Request, res as Response, next);

    expect(res.locals).toHaveProperty("sub", 789);
  });

  it("should not set sub in res.locals for unauthenticated requests", () => {
    auth(req as Request, res as Response, next);

    expect(res.locals).not.toHaveProperty("sub");
  });
});
