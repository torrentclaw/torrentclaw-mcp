import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { validateApiUrl } from "../src/config.js";

describe("validateApiUrl", () => {
  const originalEnv = process.env.TORRENTCLAW_ALLOW_PRIVATE;

  beforeEach(() => {
    delete process.env.TORRENTCLAW_ALLOW_PRIVATE;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.TORRENTCLAW_ALLOW_PRIVATE = originalEnv;
    } else {
      delete process.env.TORRENTCLAW_ALLOW_PRIVATE;
    }
  });
  it("accepts valid https URL", () => {
    expect(validateApiUrl("https://torrentclaw.com")).toBe(
      "https://torrentclaw.com",
    );
  });

  it("accepts valid http URL", () => {
    expect(validateApiUrl("http://api.example.com")).toBe(
      "http://api.example.com",
    );
  });

  it("rejects invalid URL", () => {
    expect(() => validateApiUrl("not-a-url")).toThrow("not a valid URL");
  });

  it("rejects ftp protocol", () => {
    expect(() => validateApiUrl("ftp://example.com")).toThrow(
      "only http/https",
    );
  });

  it("rejects file protocol", () => {
    expect(() => validateApiUrl("file:///etc/passwd")).toThrow(
      "only http/https",
    );
  });

  it("rejects localhost", () => {
    expect(() => validateApiUrl("http://localhost:3030")).toThrow(
      "private/reserved",
    );
  });

  it("rejects 127.0.0.1", () => {
    expect(() => validateApiUrl("http://127.0.0.1")).toThrow(
      "private/reserved",
    );
  });

  it("rejects 0.0.0.0", () => {
    expect(() => validateApiUrl("http://0.0.0.0")).toThrow(
      "private/reserved",
    );
  });

  it("rejects 10.x.x.x range", () => {
    expect(() => validateApiUrl("http://10.0.0.1")).toThrow(
      "private/reserved",
    );
  });

  it("rejects 172.16-31.x.x range", () => {
    expect(() => validateApiUrl("http://172.16.0.1")).toThrow(
      "private/reserved",
    );
    expect(() => validateApiUrl("http://172.31.255.255")).toThrow(
      "private/reserved",
    );
  });

  it("accepts 172.15.x.x (not private)", () => {
    expect(validateApiUrl("http://172.15.0.1")).toBe("http://172.15.0.1");
  });

  it("rejects 192.168.x.x range", () => {
    expect(() => validateApiUrl("http://192.168.1.1")).toThrow(
      "private/reserved",
    );
  });

  it("rejects AWS metadata IP (169.254.x.x)", () => {
    expect(() => validateApiUrl("http://169.254.169.254")).toThrow(
      "private/reserved",
    );
  });

  it("rejects IPv6 loopback ::1", () => {
    expect(() => validateApiUrl("http://[::1]")).toThrow("private/reserved");
  });

  it("allows localhost when TORRENTCLAW_ALLOW_PRIVATE=true", () => {
    process.env.TORRENTCLAW_ALLOW_PRIVATE = "true";
    expect(validateApiUrl("http://localhost:3030")).toBe(
      "http://localhost:3030",
    );
  });

  it("allows 192.168.x.x when TORRENTCLAW_ALLOW_PRIVATE=true", () => {
    process.env.TORRENTCLAW_ALLOW_PRIVATE = "true";
    expect(validateApiUrl("http://192.168.1.1")).toBe("http://192.168.1.1");
  });

  it("still rejects ftp even when TORRENTCLAW_ALLOW_PRIVATE=true", () => {
    process.env.TORRENTCLAW_ALLOW_PRIVATE = "true";
    expect(() => validateApiUrl("ftp://localhost")).toThrow("only http/https");
  });
});
