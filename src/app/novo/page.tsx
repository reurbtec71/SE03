import Header from "@/components/Header";
import CadastroForm from "@/components/CadastroForm";

export default function NovoCadastroPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="REURBTEC — Novo Cadastro" />
      <CadastroForm />
    </div>
  );
}
