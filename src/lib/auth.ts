import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "se03_session";
const ROLE_COOKIE_NAME = "se03_role"; // cookie leve, só para UX (redirect/menu) — não usado para segurança

export type Role = "agente" | "coordenador";

function secret() {
  return (
    process.env.SESSION_SECRET ||
    process.env.ACCESS_PASSWORD_COORDENADOR ||
    "se03-dev-secret"
  );
}

function sign(value: string) {
  const h = crypto.createHmac("sha256", secret()).update(value).digest("hex");
  return `${value}.${h}`;
}

function verify(signed: string): Role | null {
  const idx = signed.lastIndexOf(".");
  if (idx === -1) return null;
  const value = signed.slice(0, idx);
  const sig = signed.slice(idx + 1);
  const expected = crypto.createHmac("sha256", secret()).update(value).digest("hex");
  try {
    const ok = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    if (!ok) return null;
  } catch {
    return null;
  }
  return value === "agente" || value === "coordenador" ? value : null;
}

// Retorna o papel (role) correspondente à senha digitada, ou null se não bater com nenhuma.
export function checkPassword(input: string): Role | null {
  const agente = process.env.ACCESS_PASSWORD_AGENTE;
  const coordenador = process.env.ACCESS_PASSWORD_COORDENADOR;
  if (!agente || !coordenador) {
    throw new Error(
      "Configure ACCESS_PASSWORD_AGENTE e ACCESS_PASSWORD_COORDENADOR nas variáveis de ambiente."
    );
  }
  if (input === coordenador) return "coordenador";
  if (input === agente) return "agente";
  return null;
}

export async function createSession(role: Role) {
  const store = await cookies();
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  };
  store.set(COOKIE_NAME, sign(role), options);
  // cookie leve (não httpOnly) só para o middleware decidir redirecionamentos de UI
  store.set(ROLE_COOKIE_NAME, role, { ...options, httpOnly: false });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
  store.delete(ROLE_COOKIE_NAME);
}

// Retorna o papel autenticado (verificado com assinatura) ou null.
export async function getRole(): Promise<Role | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  return verify(raw);
}

export async function isAuthenticated() {
  return (await getRole()) !== null;
}

export async function requireCoordenador() {
  return (await getRole()) === "coordenador";
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
export const ROLE_COOKIE_NAME_EXPORT = ROLE_COOKIE_NAME;
