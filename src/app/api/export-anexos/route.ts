import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";
import { requireCoordenador } from "@/lib/auth";
import JSZip from "jszip";

const BUCKET = "anexos";

type Anexo = { nome: string; path: string; tamanho: number };

function sanitize(name: string) {
  return (name || "sem_nome")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 _-]/g, "")
    .trim()
    .slice(0, 80);
}

export async function GET(req: NextRequest) {
  if (!(await requireCoordenador())) {
    return NextResponse.json({ error: "Acesso restrito ao coordenador." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const municipio = searchParams.get("municipio");

  const supabase = getSupabaseServer();
  let query = supabase
    .from("cadastros")
    .select("id, inscricao, nome_completo, municipio, anexos");
  if (municipio) query = query.eq("municipio", municipio);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const zip = new JSZip();
  let algumArquivo = false;

  for (const row of data || []) {
    const anexos: Anexo[] = row.anexos || [];
    if (anexos.length === 0) continue;
    const folderName = `${sanitize(row.nome_completo)}_${row.inscricao || row.id.slice(0, 8)}`;
    const folder = zip.folder(folderName);
    for (const anexo of anexos) {
      const { data: fileData, error: downloadErr } = await supabase.storage
        .from(BUCKET)
        .download(anexo.path);
      if (downloadErr || !fileData) continue;
      const buffer = Buffer.from(await fileData.arrayBuffer());
      folder?.file(anexo.nome, buffer);
      algumArquivo = true;
    }
  }

  if (!algumArquivo) {
    return new NextResponse("Nenhum anexo encontrado para exportar.", { status: 200 });
  }

  const content = await zip.generateAsync({ type: "nodebuffer" });
  return new NextResponse(new Uint8Array(content), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="anexos_se03_${municipio || "todos"}_${new Date()
        .toISOString()
        .slice(0, 10)}.zip"`,
    },
  });
}
