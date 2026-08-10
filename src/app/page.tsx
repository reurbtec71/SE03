"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import {
  MUNICIPIOS, STATUS_OPCOES, PRIORIDADE_OPCOES,
} from "@/lib/constants";

type Cadastro = {
  id: string;
  inscricao: string;
  municipio: string;
  nome_completo: string;
  classificacao: string;
  renda_total: number | null;
  area_lote: number | null;
  status: string;
  prioridade: string;
};

export default function CadastrosPage() {
  const [dados, setDados] = useState<Cadastro[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [status, setStatus] = useState("");

  const carregar = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (municipio) params.set("municipio", municipio);
    if (status) params.set("status", status);
    const res = await fetch(`/api/cadastros?${params.toString()}`);
    if (res.ok) {
      const body = await res.json();
      setDados(body.data || []);
    }
    setLoading(false);
  }, [q, municipio, status]);

  useEffect(() => {
    const t = setTimeout(carregar, 250);
    return () => clearTimeout(t);
  }, [carregar]);

  async function atualizarCampo(id: string, campo: string, valor: string) {
    setDados((prev) => prev.map((d) => (d.id === id ? { ...d, [campo]: valor } : d)));
    await fetch(`/api/cadastros/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [campo]: valor }),
    });
  }

  async function excluir(id: string) {
    if (!confirm("Excluir este cadastro? Essa ação não pode ser desfeita.")) return;
    await fetch(`/api/cadastros/${id}`, { method: "DELETE" });
    carregar();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="REURBTEC — Painel do Coordenador" />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            className="flex-1 min-w-[220px] border border-gray-300 rounded-md px-3 py-2 text-sm"
            placeholder="Buscar por nome, CPF ou inscrição..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={municipio}
            onChange={(e) => setMunicipio(e.target.value)}
          >
            <option value="">Todos os municípios</option>
            {MUNICIPIOS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Todos os status</option>
            {STATUS_OPCOES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-navy text-white text-left">
                <th className="px-3 py-2">Inscrição</th>
                <th className="px-3 py-2">Município</th>
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">Classificação</th>
                <th className="px-3 py-2">Renda</th>
                <th className="px-3 py-2">Área</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Prioridade</th>
                <th className="px-3 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={9} className="px-3 py-6 text-center text-gray-400">Carregando...</td></tr>
              )}
              {!loading && dados.length === 0 && (
                <tr><td colSpan={9} className="px-3 py-6 text-center text-gray-400">Nenhum cadastro encontrado.</td></tr>
              )}
              {dados.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="px-3 py-2 font-mono text-xs">{row.inscricao}</td>
                  <td className="px-3 py-2">{row.municipio}</td>
                  <td className="px-3 py-2">
                    <Link href={`/editar/${row.id}`} className="text-navy font-medium hover:underline">
                      {row.nome_completo}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                      {row.classificacao || "REURB-S"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {row.renda_total ? `R$ ${Number(row.renda_total).toFixed(2)}` : "—"}
                  </td>
                  <td className="px-3 py-2">{row.area_lote ? `${row.area_lote} m²` : "—"}</td>
                  <td className="px-3 py-2">
                    <select
                      value={row.status || "Pendente"}
                      onChange={(e) => atualizarCampo(row.id, "status", e.target.value)}
                      className="border rounded-full text-xs px-2 py-1 bg-yellow-50"
                    >
                      {STATUS_OPCOES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={row.prioridade || "Média"}
                      onChange={(e) => atualizarCampo(row.id, "prioridade", e.target.value)}
                      className="border rounded-full text-xs px-2 py-1"
                    >
                      {PRIORIDADE_OPCOES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <Link href={`/editar/${row.id}`} className="text-xs font-semibold text-white bg-orange px-2 py-1 rounded mr-1">
                      Editar
                    </Link>
                    <button
                      onClick={() => excluir(row.id)}
                      className="text-xs font-semibold text-white bg-red-500 px-2 py-1 rounded"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
