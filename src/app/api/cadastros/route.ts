import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";
import { isAuthenticated, requireCoordenador } from "@/lib/auth";

function pad(value: string | undefined, len: number) {
  return (value || "").toString().padStart(len, "0");
}

function buildInscricao(body: Record<string, unknown>) {
  return [
    pad(body.distrito as string, 2),
    pad(body.setor as string, 2),
    pad(body.quadra as string, 3),
    pad(body.lote as string, 4),
    pad(body.sequencial as string, 3),
  ].join(".");
}

export async function GET(req: NextRequest) {
  if (!(await requireCoordenador())) {
    return NextResponse.json({ error: "Acesso restrito ao coordenador." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const municipio = searchParams.get("municipio");
  const status = searchParams.get("status");
  const classificacao = searchParams.get("classificacao");

  const supabase = getSupabaseServer();
  let query = supabase
    .from("cadastros")
    .select("*")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(
      `nome_completo.ilike.%${q}%,cpf.ilike.%${q}%,inscricao.ilike.%${q}%`
    );
  }
  if (municipio) query = query.eq("municipio", municipio);
  if (status) query = query.eq("status", status);
  if (classificacao) query = query.eq("classificacao", classificacao);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await req.json();
  const inscricao = buildInscricao(body);

  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("cadastros")
    .insert([{ ...body, inscricao }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}
