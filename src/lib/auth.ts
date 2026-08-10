import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "se03_session";
const SESSION_VALUE = "ok";

function secret() {
  return process.env.SESSION_SECRET || process.env.ACCESS_PASSWORD || "se03-dev-secret";
}

function sign(value: string) {
  const h = crypto.createHmac("sha256", secret()).update(value).digest("hex");
  return `${value}.${h}`;
}

function verify(signed: string) {
  const idx = signed.lastIndexOf(".");
  if (idx === -1) return false;
  const value = signed.slice(0, idx);
  const sig = signed.slice(idx + 1);
  const expected = crypto.createHmac("sha256", secret()).update(value).digest("hex");
  try {
    return (
      value === SESSION_VALUE &&
      crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
    );
  } catch {
    return false;
  }
}

export function checkPassword(input: string) {
  const expected = process.env.ACCESS_PASSWORD;
  if (!expected) {
    throw new Error("Configure ACCESS_PASSWORD nas variáveis de ambiente.");
  }
  return input === expected;
}

export async function createSession() {
  const store = await cookies();
  store.set(COOKIE_NAME, sign(SESSION_VALUE), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAuthenticated() {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return false;
  return verify(raw);
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
