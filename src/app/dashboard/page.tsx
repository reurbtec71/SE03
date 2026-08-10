"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { MUNICIPIOS } from "@/lib/constants";

type Cadastro = Record<string, unknown>;

function pct(n: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((n / total) * 100)}%`;
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-lg border shadow-sm p-4 text-center">
      <div className="text-2xl font-bold text-navy">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
      {sub && <div className="text-xs text-bluegray">{sub}</div>}
    </div>
  );
}

function Bar({ label, n, total }: { label: string; n: number; total: number }) {
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{label}</span>
        <span>{n} ({pct(n, total)})</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded">
        <div className="h-2 bg-orange rounded" style={{ width: pct(n, total) }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [dados, setDados] = useState<Cadastro[]>([]);
  const [loading, setLoading] = useState(true);
  const [municipio, setMunicipio] = useState("");

  useEffect(() => {
    async function carregar() {
      setLoading(true);
      const params = new URLSearchParams();
      if (municipio) params.set("municipio", municipio);
      const r = await fetch(`/api/cadastros?${params.toString()}`);
      const b = await r.json();
      setDados(b.data || []);
      setLoading(false);
    }
    carregar();
  }, [municipio]);

  const total = dados.length;
  const bool = (key: string) => dados.filter((d) => d[key] === true).length;
  const eq = (key: string, val: string) => dados.filter((d) => d[key] === val).length;
  const rendas = dados
    .map((d) => Number(d.renda_total))
    .filter((n) => !Number.isNaN(n) && n > 0);
  const min = rendas.length ? Math.min(...rendas) : 0;
  const max = rendas.length ? Math.max(...rendas) : 0;
  const media = rendas.length ? rendas.reduce((a, b) => a + b, 0) / rendas.length : 0;

  const porAgente = Array.from(
    new Set(dados.map((d) => (d.agente_campo as string) || "—"))
  ).map((agente) => {
    const doAgente = dados.filter((d) => d.agente_campo === agente);
    return {
      agente,
      total: doAgente.length,
      reurbS: doAgente.filter((d) => (d.classificacao || "REURB-S") === "REURB-S").length,
      reurbE: doAgente.filter((d) => d.classificacao === "REURB-E").length,
      aprovados: doAgente.filter((d) => d.status === "Aprovado").length,
      pendentes: doAgente.filter((d) => (d.status || "Pendente") === "Pendente").length,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="REURBTEC — Painel do Coordenador" municipioFiltro={municipio} />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-navy">Visão Geral do Projeto</h2>
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
        </div>
        {loading ? (
          <p className="text-gray-400 text-sm">Carregando...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <Stat label="Total Cadastros" value={total} />
              <Stat label="REURB-S" value={dados.filter((d) => (d.classificacao || "REURB-S") === "REURB-S").length} sub={pct(dados.filter((d) => (d.classificacao || "REURB-S") === "REURB-S").length, total)} />
              <Stat label="REURB-E" value={eq("classificacao", "REURB-E")} sub={pct(eq("classificacao", "REURB-E"), total)} />
              <Stat label="Prioridade Alta" value={eq("prioridade", "Alta")} />
              <Stat label="PCD" value={dados.reduce((s, d) => s + (Number(d.pcd) || 0), 0)} />
              <Stat label="Gestantes" value={bool("gestante")} />
              <Stat label="Área de Risco" value={bool("area_risco")} />
              <Stat label="Reassentamento" value={bool("necessita_reassentamento")} />
              <Stat label="Bolsa Família" value={bool("bolsa_familia")} />
              <Stat label="Renda Mínima" value={`R$ ${min.toFixed(2)}`} />
              <Stat label="Renda Média" value={`R$ ${media.toFixed(2)}`} />
              <Stat label="Renda Máxima" value={`R$ ${max.toFixed(2)}`} />
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg border shadow-sm p-4">
                <h3 className="font-semibold text-navy mb-3 text-sm">Status dos Processos</h3>
                {["Pendente", "Em análise", "Aprovado", "Indeferido"].map((s) => (
                  <Bar key={s} label={s} n={eq("status", s)} total={total} />
                ))}
              </div>
              <div className="bg-white rounded-lg border shadow-sm p-4">
                <h3 className="font-semibold text-navy mb-3 text-sm">Classificação REURB</h3>
                <Bar label="REURB-S (Social)" n={dados.filter((d) => (d.classificacao || "REURB-S") === "REURB-S").length} total={total} />
                <Bar label="REURB-E (Específico)" n={eq("classificacao", "REURB-E")} total={total} />
                <Bar label="Área de Risco" n={bool("area_risco")} total={total} />
                <Bar label="Necessita Reassent." n={bool("necessita_reassentamento")} total={total} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg border shadow-sm p-4">
                <h3 className="font-semibold text-navy mb-3 text-sm">Infraestrutura Urbana</h3>
                <Bar label="Iluminação Pública" n={bool("iluminacao_publica")} total={total} />
                <Bar label="Drenagem Pluvial" n={bool("drenagem_pluvial")} total={total} />
                <Bar label="Acesso a Transporte" n={bool("acesso_transporte")} total={total} />
              </div>
              <div className="bg-white rounded-lg border shadow-sm p-4">
                <h3 className="font-semibold text-navy mb-3 text-sm">Cadastros por Município (Lote 3)</h3>
                {MUNICIPIOS.map((m) => (
                  <Bar key={m} label={m} n={dados.filter((d) => d.municipio === m).length} total={total} />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border shadow-sm p-4">
              <h3 className="font-semibold text-navy mb-3 text-sm">Cadastros por Agente</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-1">Agente</th>
                    <th className="py-1">Total</th>
                    <th className="py-1">REURB-S</th>
                    <th className="py-1">REURB-E</th>
                    <th className="py-1">Aprovados</th>
                    <th className="py-1">Pendentes</th>
                  </tr>
                </thead>
                <tbody>
                  {porAgente.map((r) => (
                    <tr key={r.agente} className="border-b last:border-0">
                      <td className="py-1">{r.agente}</td>
                      <td className="py-1">{r.total}</td>
                      <td className="py-1">{r.reurbS}</td>
                      <td className="py-1">{r.reurbE}</td>
                      <td className="py-1">{r.aprovados}</td>
                      <td className="py-1">{r.pendentes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
