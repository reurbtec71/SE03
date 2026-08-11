import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";
import { isAuthenticated, requireCoordenador } from "@/lib/auth";

function pad(value: string | undefined, len: number) {
  return (value || "").toString().padStart(len, "0");
}

function temFields(body: Record<string, unknown>) {
  return ["distrito", "setor", "quadra", "lote", "sequencial"].some(
    (k) => String(body[k] ?? "").trim() !== ""
  );
}

function codigoAleatorio() {
  return Math.random().toString(36).slice(2, 7).toUpperCase();
}

function buildInscricao(body: Record<string, unknown>) {
  if (temFields(body)) {
    return [
      pad(body.distrito as string, 2),
      pad(body.setor as string, 2),
      pad(body.quadra as string, 3),
      pad(body.lote as string, 4),
      pad(body.sequencial as string, 3),
    ].join(".");
  }
  // Sem código cadastral informado — gera um identificador único a partir do
  // município e de um sufixo aleatório, em vez de repetir "00.00.000.0000.000".
  const municipio = String(body.municipio || "SE03")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .slice(0, 3)
    .toUpperCase();
  return `${municipio}-${Date.now().toString(36).toUpperCase()}-${codigoAleatorio()}`;
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
  const supabase = getSupabaseServer();

  let inscricao = buildInscricao(body);
  let tentativa = 0;
  let data, error;

  do {
    ({ data, error } = await supabase
      .from("cadastros")
      .insert([{ ...body, inscricao }])
      .select()
      .single());

    if (error && error.code === "23505" && !temFields(body) && tentativa < 3) {
      // Colisão rara no código gerado automaticamente — tenta de novo com outro sufixo.
      inscricao = buildInscricao(body);
      tentativa++;
      continue;
    }
    break;
    // eslint-disable-next-line no-constant-condition
  } while (true);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}
