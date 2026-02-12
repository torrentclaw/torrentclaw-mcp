import { describe, it, expect } from "vitest";
import { validateApiUrl } from "../src/config.js";

describe("validateApiUrl", () => {
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
    expect(() => validateApiUrl("http://0.0.0.0")).toThrow("private/reserved");
  });

  it("rejects 10.x.x.x range", () => {
    expect(() => validateApiUrl("http://10.0.0.1")).toThrow("private/reserved");
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
});
