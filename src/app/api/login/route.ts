import { NextRequest, NextResponse } from "next/server";
import { checkPassword, createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { senha } = await req.json();

  let ok = false;
  try {
    ok = checkPassword(senha || "");
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }

  if (!ok) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  await createSession();
  return NextResponse.json({ ok: true });
}
