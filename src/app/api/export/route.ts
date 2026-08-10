import { NextResponse } from "next/server";
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

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("cadastros")
    .select("*")
    .order("created_at", { ascending: false });

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
      "Content-Disposition": `attachment; filename="cadastros_se03_${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
