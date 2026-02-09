const PRIVATE_IP_PATTERNS = [
  /^localhost$/i,
  /^127\.\d+\.\d+\.\d+$/,
  /^::1$/,
  /^::$/,
  /^0\.0\.0\.0$/,
  /^10\.\d+\.\d+\.\d+$/,
  /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/,
  /^192\.168\.\d+\.\d+$/,
  /^169\.254\.\d+\.\d+$/, // link-local / cloud metadata
];

export function validateApiUrl(raw: string): string {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(`Invalid TORRENTCLAW_API_URL: not a valid URL`);
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(
      `Invalid TORRENTCLAW_API_URL: only http/https protocols allowed`,
    );
  }

  const allowPrivate = process.env.TORRENTCLAW_ALLOW_PRIVATE === "true";
  if (!allowPrivate) {
    const hostname = parsed.hostname.replace(/^\[|\]$/g, "");
    if (PRIVATE_IP_PATTERNS.some((re) => re.test(hostname))) {
      throw new Error(
        `Invalid TORRENTCLAW_API_URL: private/reserved addresses not allowed. Set TORRENTCLAW_ALLOW_PRIVATE=true for self-hosted setups.`,
      );
    }
  }

  return raw;
}

export const config = {
  apiUrl: validateApiUrl(
    process.env.TORRENTCLAW_API_URL || "https://torrentclaw.com",
  ),
  version: process.env.npm_package_version || "1.0.0",
} as const;
