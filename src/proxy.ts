import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/login"];

// Rotas de página que só o coordenador deve ver (agente é redirecionado para /novo).
// Isto é só UX — a segurança de verdade é aplicada nas rotas de API (server-side).
const COORDENADOR_ONLY_PAGES = ["/", "/dashboard"];
const COORDENADOR_ONLY_PREFIXES = ["/editar"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    PUBLIC_PATHS.some((p) => pathname === p) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const hasCookie = req.cookies.get("se03_session");
  if (!hasCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const role = req.cookies.get("se03_role")?.value;
  if (
    role === "agente" &&
    (COORDENADOR_ONLY_PAGES.includes(pathname) ||
      COORDENADOR_ONLY_PREFIXES.some((p) => pathname.startsWith(p)))
  ) {
    const url = req.nextUrl.clone();
    url.pathname = "/novo";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
