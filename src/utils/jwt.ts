const TOKEN_EXPIRY_SKEW_MS = 60_000;

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const segment = token.split(".")[1];
    if (!segment) {
      return null;
    }

    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );

    if (typeof atob !== "function") {
      return null;
    }

    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function isAccessTokenExpiringSoon(
  token: string,
  skewMs = TOKEN_EXPIRY_SKEW_MS,
): boolean {
  const payload = decodeJwtPayload(token);
  const exp = payload?.exp;

  if (typeof exp !== "number") {
    return false;
  }

  return Date.now() >= exp * 1000 - skewMs;
}
