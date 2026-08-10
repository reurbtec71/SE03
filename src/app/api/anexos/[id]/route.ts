import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";

const BUCKET = "anexos";

type Anexo = { nome: string; path: string; tamanho: number };

async function ensureBucket(supabase: ReturnType<typeof getSupabaseServer>) {
  const { data } = await supabase.storage.getBucket(BUCKET);
  if (!data) {
    await supabase.storage.createBucket(BUCKET, { public: false });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const { id } = await params;
  const supabase = getSupabaseServer();
  await ensureBucket(supabase);

  const form = await req.formData();
  const files = form.getAll("files") as File[];
  if (files.length === 0) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }

  const { data: cadastro, error: fetchErr } = await supabase
    .from("cadastros")
    .select("anexos")
    .eq("id", id)
    .single();
  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 404 });

  const existentes: Anexo[] = cadastro?.anexos || [];
  const novos: Anexo[] = [];

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const path = `${id}/${Date.now()}_${file.name}`;
    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type || "application/octet-stream" });
    if (uploadErr) {
      return NextResponse.json({ error: uploadErr.message }, { status: 500 });
    }
    novos.push({ nome: file.name, path, tamanho: file.size });
  }

  const anexos = [...existentes, ...novos];
  const { error: updateErr } = await supabase
    .from("cadastros")
    .update({ anexos })
    .eq("id", id);
  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  return NextResponse.json({ anexos });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const { id } = await params;
  const { path } = await req.json();

  const supabase = getSupabaseServer();
  const { data: cadastro, error: fetchErr } = await supabase
    .from("cadastros")
    .select("anexos")
    .eq("id", id)
    .single();
  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 404 });

  await supabase.storage.from(BUCKET).remove([path]);

  const anexos = ((cadastro?.anexos || []) as Anexo[]).filter((a) => a.path !== path);
  const { error: updateErr } = await supabase
    .from("cadastros")
    .update({ anexos })
    .eq("id", id);
  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  return NextResponse.json({ anexos });
}
