"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setErro(body.error || "Não foi possível entrar.");
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-xl shadow-md w-full max-w-sm p-8 text-center">
        <span className="inline-block bg-navy text-white text-sm font-bold rounded-md px-4 py-2 mb-4">
          REURBTEC
        </span>
        <h1 className="text-xl font-bold text-navy mb-1">
          Cadastro Habitacional — Lote 3
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Sergipe — OS nº 03/2026 · SEASIC/SE
        </p>

        <form onSubmit={handleSubmit} className="text-left">
          <label className="block text-sm text-gray-700 mb-1">Senha de acesso</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Digite sua senha"
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-navy"
            autoFocus
          />
          {erro && <p className="text-sm text-red-600 mb-3">{erro}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary rounded-md py-2 font-semibold disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-6">REURBTEC Engenharia & Topografia</p>
      </div>
    </div>
  );
}
