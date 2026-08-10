import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";

function csvEscape(value: unknown) {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const municipio = searchParams.get("municipio");

  const supabase = getSupabaseServer();
  let query = supabase.from("cadastros").select("*").order("created_at", { ascending: false });
  if (municipio) query = query.eq("municipio", municipio);

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || data.length === 0) {
    return new NextResponse("Sem dados para exportar.", { status: 200 });
  }

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => csvEscape((row as Record<string, unknown>)[h])).join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cadastros_se03_${municipio || "todos"}_${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
