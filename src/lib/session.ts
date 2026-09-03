import { createHmac, timingSafeEqual } from "crypto";

export const SESSION_COOKIE = "kharcha_session";
export const SESSION_MAX_AGE = 60 * 60; // 1 hour

const SESSION_SECRET =
  process.env.SESSION_SECRET || "kharcha-tracker-local-session-secret";

export function createSessionToken() {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = String(expiresAt);
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function isValidSessionToken(token: string | undefined) {
  if (!token) return false;

  const separator = token.lastIndexOf(".");
  if (separator <= 0) return false;

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  if (!payload || !signature) return false;

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
    return false;
  }

  const expected = sign(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(signatureBuffer, expectedBuffer);
}

function sign(payload: string) {
  return createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
}
