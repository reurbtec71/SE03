import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";
import { requireCoordenador } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireCoordenador())) {
    return NextResponse.json({ error: "Acesso restrito ao coordenador." }, { status: 403 });
  }
  const { id } = await params;
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("cadastros")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireCoordenador())) {
    return NextResponse.json({ error: "Acesso restrito ao coordenador." }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  delete body.id;
  delete body.created_at;

  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("cadastros")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireCoordenador())) {
    return NextResponse.json({ error: "Acesso restrito ao coordenador." }, { status: 403 });
  }
  const { id } = await params;
  const supabase = getSupabaseServer();
  const { error } = await supabase.from("cadastros").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
