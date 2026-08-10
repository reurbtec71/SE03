import Header from "@/components/Header";
import CadastroForm from "@/components/CadastroForm";
import { getSupabaseServer } from "@/lib/supabase";
import { notFound } from "next/navigation";

export default async function EditarCadastroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getSupabaseServer();
  const { data } = await supabase.from("cadastros").select("*").eq("id", id).single();

  if (!data) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="REURBTEC — Editar Cadastro" />
      <CadastroForm initialData={data} cadastroId={id} />
    </div>
  );
}
