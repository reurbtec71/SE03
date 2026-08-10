"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MUNICIPIOS, UFS, CONTAGEM_OPCOES, NACIONALIDADE_OPCOES, SEXO_OPCOES,
  ESTADO_CIVIL_OPCOES, ESCOLARIDADE_OPCOES, SITUACAO_EMPREGO_OPCOES,
  TEMPO_OCUPACAO_OPCOES, FORMA_AQUISICAO_OPCOES, TIPO_CONTRATO_OPCOES,
  PAVIMENTOS_OPCOES, MATERIAL_PAREDES_OPCOES, MATERIAL_COBERTURA_OPCOES,
  MATERIAL_PISO_OPCOES, ESTADO_CONSERVACAO_OPCOES, TIPO_USO_OPCOES,
  AGUA_OPCOES, ESGOTO_OPCOES, ENERGIA_OPCOES, COLETA_LIXO_OPCOES,
  PAVIMENTACAO_OPCOES, TIPO_RISCO_OPCOES, CONDICAO_HABITACIONAL_OPCOES,
} from "@/lib/constants";

type Props = {
  initialData?: Record<string, unknown>;
  cadastroId?: string;
};

const SECOES = [
  "S1 — Identificação do Imóvel",
  "S2 — Responsável Familiar",
  "S3 — Composição Familiar",
  "S4 — Dados Socioeconômicos",
  "S5 — Situação Ocupacional",
  "S6 — Características Físicas",
  "S7 — Infraestrutura Urbana",
  "S8 — Vulnerabilidade Social",
  "S9 — Documentos",
  "S10 — Declarações LGPD",
];

function Field({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-sm text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy";

function Select({
  value, onChange, options, placeholder = "Selecione...",
}: { value: string; onChange: (v: string) => void; options: readonly string[]; placeholder?: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

function SimNao({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-4 text-sm">
      <label className="flex items-center gap-1">
        <input type="radio" checked={value === true} onChange={() => onChange(true)} /> Sim
      </label>
      <label className="flex items-center gap-1">
        <input type="radio" checked={value === false} onChange={() => onChange(false)} /> Não
      </label>
    </div>
  );
}

export default function CadastroForm({ initialData, cadastroId }: Props) {
  const router = useRouter();
  const [secao, setSecao] = useState(0);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [d, setD] = useState<Record<string, unknown>>(initialData || {});

  function set(key: string, value: unknown) {
    setD((prev) => ({ ...prev, [key]: value }));
  }
  const v = (key: string) => (d[key] as string) ?? "";
  const vb = (key: string) => (d[key] as boolean) ?? false;

  async function salvar() {
    setSaving(true);
    setErro("");
    try {
      const url = cadastroId ? `/api/cadastros/${cadastroId}` : "/api/cadastros";
      const method = cadastroId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(d),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setErro(body.error || "Erro ao salvar cadastro.");
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <div className="bg-blue-50 text-navy text-sm font-medium rounded-md px-4 py-2 mb-4">
        Inscrição: {v("inscricao") || "—"}
      </div>

      <div className="flex items-center justify-between mb-1 text-sm text-gray-500">
        <span>Seção {secao + 1} de {SECOES.length}</span>
        <span className="font-medium text-navy">{SECOES[secao]}</span>
      </div>
      <div className="w-full h-1.5 bg-gray-200 rounded mb-3">
        <div
          className="h-1.5 bg-navy rounded"
          style={{ width: `${((secao + 1) / SECOES.length) * 100}%` }}
        />
      </div>
      <div className="flex flex-wrap gap-1 mb-6">
        {SECOES.map((s, i) => (
          <button
            key={s}
            onClick={() => setSecao(i)}
            className={`px-2.5 py-1 text-xs rounded-full font-medium ${
              i === secao ? "bg-navy text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            S{i + 1}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="font-bold text-navy mb-4 border-b pb-2">{SECOES[secao]}</h2>

        {secao === 0 && (
          <>
            <Field label="Município" required>
              <Select value={v("municipio")} onChange={(x) => set("municipio", x)} options={MUNICIPIOS} />
            </Field>
            <Field label="Distrito (2 dígitos)" required>
              <input className={inputClass} placeholder="00" value={v("distrito")} onChange={(e) => set("distrito", e.target.value)} />
            </Field>
            <Field label="Setor (2 dígitos)" required>
              <input className={inputClass} placeholder="00" value={v("setor")} onChange={(e) => set("setor", e.target.value)} />
            </Field>
            <Field label="Quadra (3 dígitos)" required>
              <input className={inputClass} placeholder="000" value={v("quadra")} onChange={(e) => set("quadra", e.target.value)} />
            </Field>
            <Field label="Lote (4 dígitos)" required>
              <input className={inputClass} placeholder="0000" value={v("lote")} onChange={(e) => set("lote", e.target.value)} />
            </Field>
            <Field label="Sequencial (3 dígitos)" required>
              <input className={inputClass} placeholder="000" value={v("sequencial")} onChange={(e) => set("sequencial", e.target.value)} />
            </Field>
            <Field label="Logradouro" required>
              <input className={inputClass} value={v("logradouro")} onChange={(e) => set("logradouro", e.target.value)} />
            </Field>
            <Field label="Número" required>
              <input className={inputClass} value={v("numero")} onChange={(e) => set("numero", e.target.value)} />
            </Field>
            <Field label="Complemento">
              <input className={inputClass} value={v("complemento")} onChange={(e) => set("complemento", e.target.value)} />
            </Field>
            <Field label="CEP">
              <input className={inputClass} value={v("cep")} onChange={(e) => set("cep", e.target.value)} />
            </Field>
            <Field label="Data do Cadastro" required>
              <input type="date" className={inputClass} value={v("data_cadastro")} onChange={(e) => set("data_cadastro", e.target.value)} />
            </Field>
            <Field label="Agente de Campo" required>
              <input className={inputClass} placeholder="Nome do agente" value={v("agente_campo")} onChange={(e) => set("agente_campo", e.target.value)} />
            </Field>
            <Field label="Coordenador">
              <input className={inputClass} placeholder="Nome do coordenador" value={v("coordenador")} onChange={(e) => set("coordenador", e.target.value)} />
            </Field>
          </>
        )}

        {secao === 1 && (
          <>
            <Field label="Nome Completo" required>
              <input className={inputClass} value={v("nome_completo")} onChange={(e) => set("nome_completo", e.target.value)} />
            </Field>
            <Field label="CPF" required>
              <input className={inputClass} value={v("cpf")} onChange={(e) => set("cpf", e.target.value)} />
            </Field>
            <Field label="RG / Nº Identidade" required>
              <input className={inputClass} value={v("rg")} onChange={(e) => set("rg", e.target.value)} />
            </Field>
            <Field label="Órgão Emissor / UF">
              <input className={inputClass} value={v("orgao_emissor")} onChange={(e) => set("orgao_emissor", e.target.value)} />
            </Field>
            <Field label="Data de Nascimento" required>
              <input type="date" className={inputClass} value={v("data_nascimento")} onChange={(e) => set("data_nascimento", e.target.value)} />
            </Field>
            <Field label="Nacionalidade">
              <Select value={v("nacionalidade")} onChange={(x) => set("nacionalidade", x)} options={NACIONALIDADE_OPCOES} />
            </Field>
            <Field label="Sexo">
              <Select value={v("sexo")} onChange={(x) => set("sexo", x)} options={SEXO_OPCOES} />
            </Field>
            <Field label="Estado Civil" required>
              <Select value={v("estado_civil")} onChange={(x) => set("estado_civil", x)} options={ESTADO_CIVIL_OPCOES} />
            </Field>
            <Field label="Naturalidade">
              <input className={inputClass} value={v("naturalidade")} onChange={(e) => set("naturalidade", e.target.value)} />
            </Field>
            <Field label="UF de Nascimento" required>
              <Select value={v("uf_nascimento")} onChange={(x) => set("uf_nascimento", x)} options={UFS} />
            </Field>
            <Field label="Filiação — Mãe" required>
              <input className={inputClass} value={v("filiacao_mae")} onChange={(e) => set("filiacao_mae", e.target.value)} />
            </Field>
            <Field label="Filiação — Pai">
              <input className={inputClass} value={v("filiacao_pai")} onChange={(e) => set("filiacao_pai", e.target.value)} />
            </Field>
            <Field label="Bairro" required>
              <input className={inputClass} value={v("bairro")} onChange={(e) => set("bairro", e.target.value)} />
            </Field>
            <Field label="Telefone / WhatsApp" required>
              <input className={inputClass} value={v("telefone")} onChange={(e) => set("telefone", e.target.value)} />
            </Field>
            <Field label="E-mail" required>
              <input className={inputClass} value={v("email")} onChange={(e) => set("email", e.target.value)} />
            </Field>
          </>
        )}

        {secao === 2 && (
          <>
            {[
              ["total_moradores", "Total de Moradores"],
              ["criancas_0_6", "Crianças 0–6 anos"],
              ["criancas_7_14", "Crianças 7–14 anos"],
              ["adolescentes_15_17", "Adolescentes 15–17 anos"],
              ["adultos_18_59", "Adultos 18–59 anos"],
              ["idosos_60", "Idosos 60+ anos"],
              ["pcd", "Pessoas com Deficiência"],
            ].map(([key, label]) => (
              <Field label={label} key={key}>
                <Select value={v(key)} onChange={(x) => set(key, x)} options={CONTAGEM_OPCOES} />
              </Field>
            ))}
            <Field label="Gestante na família?">
              <SimNao value={vb("gestante")} onChange={(x) => set("gestante", x)} />
            </Field>
            <Field label="Lactante na família?">
              <SimNao value={vb("lactante")} onChange={(x) => set("lactante", x)} />
            </Field>
          </>
        )}

        {secao === 3 && (
          <>
            <Field label="Renda Total Familiar (R$)" required>
              <input type="number" step="0.01" className={inputClass} value={v("renda_total")} onChange={(e) => set("renda_total", e.target.value)} />
            </Field>
            <Field label="Pessoas que contribuem com renda">
              <Select value={v("pessoas_renda")} onChange={(x) => set("pessoas_renda", x)} options={CONTAGEM_OPCOES} />
            </Field>
            <Field label="Recebe Bolsa Família?">
              <SimNao value={vb("bolsa_familia")} onChange={(x) => set("bolsa_familia", x)} />
            </Field>
            <Field label="Recebe BPC?">
              <SimNao value={vb("bpc")} onChange={(x) => set("bpc", x)} />
            </Field>
            <Field label="Outras transferências">
              <input className={inputClass} value={v("outras_transferencias")} onChange={(e) => set("outras_transferencias", e.target.value)} />
            </Field>
            <Field label="Escolaridade do Responsável">
              <Select value={v("escolaridade")} onChange={(x) => set("escolaridade", x)} options={ESCOLARIDADE_OPCOES} />
            </Field>
            <Field label="Situação de Emprego">
              <Select value={v("situacao_emprego")} onChange={(x) => set("situacao_emprego", x)} options={SITUACAO_EMPREGO_OPCOES} />
            </Field>
            <Field label="Profissão">
              <input className={inputClass} value={v("profissao")} onChange={(e) => set("profissao", e.target.value)} />
            </Field>
          </>
        )}

        {secao === 4 && (
          <>
            <Field label="Tempo de Ocupação">
              <Select value={v("tempo_ocupacao")} onChange={(x) => set("tempo_ocupacao", x)} options={TEMPO_OCUPACAO_OPCOES} />
            </Field>
            <Field label="Forma de Aquisição">
              <Select value={v("forma_aquisicao")} onChange={(x) => set("forma_aquisicao", x)} options={FORMA_AQUISICAO_OPCOES} />
            </Field>
            <Field label="Possui Contrato?">
              <SimNao value={vb("possui_contrato")} onChange={(x) => set("possui_contrato", x)} />
            </Field>
            <Field label="Tipo de Contrato">
              <Select value={v("tipo_contrato")} onChange={(x) => set("tipo_contrato", x)} options={TIPO_CONTRATO_OPCOES} />
            </Field>
            <Field label="Paga Aluguel?">
              <SimNao value={vb("paga_aluguel")} onChange={(x) => set("paga_aluguel", x)} />
            </Field>
            <Field label="Valor do Aluguel (R$)">
              <input type="number" step="0.01" className={inputClass} value={v("valor_aluguel")} onChange={(e) => set("valor_aluguel", e.target.value)} />
            </Field>
            <Field label="Há Conflito Fundiário?">
              <SimNao value={vb("conflito_fundiario")} onChange={(x) => set("conflito_fundiario", x)} />
            </Field>
            <Field label="Descrição do Conflito">
              <textarea className={inputClass} value={v("descricao_conflito")} onChange={(e) => set("descricao_conflito", e.target.value)} />
            </Field>
          </>
        )}

        {secao === 5 && (
          <>
            <Field label="Área do Lote (m²)" required>
              <input type="number" step="0.01" className={inputClass} value={v("area_lote")} onChange={(e) => set("area_lote", e.target.value)} />
            </Field>
            <Field label="Área Construída (m²)" required>
              <input type="number" step="0.01" className={inputClass} value={v("area_construida")} onChange={(e) => set("area_construida", e.target.value)} />
            </Field>
            <Field label="Número de Pavimentos">
              <Select value={v("pavimentos")} onChange={(x) => set("pavimentos", x)} options={PAVIMENTOS_OPCOES} />
            </Field>
            <Field label="Material das Paredes">
              <Select value={v("material_paredes")} onChange={(x) => set("material_paredes", x)} options={MATERIAL_PAREDES_OPCOES} />
            </Field>
            <Field label="Material da Cobertura">
              <Select value={v("material_cobertura")} onChange={(x) => set("material_cobertura", x)} options={MATERIAL_COBERTURA_OPCOES} />
            </Field>
            <Field label="Material do Piso">
              <Select value={v("material_piso")} onChange={(x) => set("material_piso", x)} options={MATERIAL_PISO_OPCOES} />
            </Field>
            <Field label="Estado de Conservação">
              <Select value={v("estado_conservacao")} onChange={(x) => set("estado_conservacao", x)} options={ESTADO_CONSERVACAO_OPCOES} />
            </Field>
            <Field label="Tipo de Uso">
              <Select value={v("tipo_uso")} onChange={(x) => set("tipo_uso", x)} options={TIPO_USO_OPCOES} />
            </Field>
            <Field label="Descrição (se Misto)">
              <input className={inputClass} value={v("descricao_uso_misto")} onChange={(e) => set("descricao_uso_misto", e.target.value)} />
            </Field>
          </>
        )}

        {secao === 6 && (
          <>
            <Field label="Abastecimento de Água" required>
              <Select value={v("agua")} onChange={(x) => set("agua", x)} options={AGUA_OPCOES} />
            </Field>
            <Field label="Esgotamento Sanitário" required>
              <Select value={v("esgoto")} onChange={(x) => set("esgoto", x)} options={ESGOTO_OPCOES} />
            </Field>
            <Field label="Energia Elétrica" required>
              <Select value={v("energia")} onChange={(x) => set("energia", x)} options={ENERGIA_OPCOES} />
            </Field>
            <Field label="Coleta de Lixo" required>
              <Select value={v("coleta_lixo")} onChange={(x) => set("coleta_lixo", x)} options={COLETA_LIXO_OPCOES} />
            </Field>
            <Field label="Pavimentação da Via" required>
              <Select value={v("pavimentacao")} onChange={(x) => set("pavimentacao", x)} options={PAVIMENTACAO_OPCOES} />
            </Field>
            <Field label="Iluminação Pública?" required>
              <SimNao value={vb("iluminacao_publica")} onChange={(x) => set("iluminacao_publica", x)} />
            </Field>
            <Field label="Drenagem Pluvial?" required>
              <SimNao value={vb("drenagem_pluvial")} onChange={(x) => set("drenagem_pluvial", x)} />
            </Field>
            <Field label="Acesso a Transporte?" required>
              <SimNao value={vb("acesso_transporte")} onChange={(x) => set("acesso_transporte", x)} />
            </Field>
          </>
        )}

        {secao === 7 && (
          <>
            <Field label="Área de Risco?" required>
              <SimNao value={vb("area_risco")} onChange={(x) => set("area_risco", x)} />
            </Field>
            <Field label="Tipo de Risco">
              <Select value={v("tipo_risco")} onChange={(x) => set("tipo_risco", x)} options={TIPO_RISCO_OPCOES} />
            </Field>
            <Field label="Próximo a Curso d'Água?" required>
              <SimNao value={vb("proximo_curso_dagua")} onChange={(x) => set("proximo_curso_dagua", x)} />
            </Field>
            <Field label="Próximo a Área de Preservação?" required>
              <SimNao value={vb("proximo_area_preservacao")} onChange={(x) => set("proximo_area_preservacao", x)} />
            </Field>
            <Field label="Condição Habitacional" required>
              <Select value={v("condicao_habitacional")} onChange={(x) => set("condicao_habitacional", x)} options={CONDICAO_HABITACIONAL_OPCOES} />
            </Field>
            <Field label="Necessita Reassentamento?" required>
              <SimNao value={vb("necessita_reassentamento")} onChange={(x) => set("necessita_reassentamento", x)} />
            </Field>
          </>
        )}

        {secao === 8 && (
          <>
            {[
              ["possui_rg", "Possui RG?"],
              ["possui_cpf", "Possui CPF?"],
              ["certidao_nascimento", "Certidão de Nascimento?"],
              ["certidao_casamento", "Certidão de Casamento?"],
              ["comprovante_residencia", "Comprovante de Residência?"],
              ["iptu", "IPTU?"],
              ["contrato_compra", "Contrato de Compra?"],
              ["declaracao_posse", "Declaração de Posse?"],
              ["planta_imovel", "Planta do Imóvel?"],
            ].map(([key, label]) => (
              <Field label={label} key={key}>
                <SimNao value={vb(key)} onChange={(x) => set(key, x)} />
              </Field>
            ))}
            <Field label="Outros Documentos (descrever)">
              <textarea className={inputClass} value={v("outros_documentos")} onChange={(e) => set("outros_documentos", e.target.value)} />
            </Field>
          </>
        )}

        {secao === 9 && (
          <>
            <Field label="Aceite da LGPD? (obrigatório)" required>
              <SimNao value={vb("aceite_lgpd")} onChange={(x) => set("aceite_lgpd", x)} />
            </Field>
            <Field label="Data do Aceite">
              <input type="date" className={inputClass} value={v("data_aceite")} onChange={(e) => set("data_aceite", e.target.value)} />
            </Field>
            <Field label="Responsável pela Coleta">
              <input className={inputClass} placeholder="Nome do agente" value={v("responsavel_coleta")} onChange={(e) => set("responsavel_coleta", e.target.value)} />
            </Field>
            <Field label="Observações LGPD">
              <textarea className={inputClass} value={v("observacoes_lgpd")} onChange={(e) => set("observacoes_lgpd", e.target.value)} />
            </Field>
            <p className="text-xs text-gray-500 mt-2">
              Anexos de documentos (PDF/JPG/PNG) podem ser adicionados posteriormente via um bucket
              do Supabase Storage — não incluído nesta versão inicial.
            </p>
          </>
        )}

        {erro && <p className="text-sm text-red-600 mt-4">{erro}</p>}

        <div className="flex justify-between mt-6 pt-4 border-t">
          <button
            disabled={secao === 0}
            onClick={() => setSecao((s) => Math.max(0, s - 1))}
            className="px-4 py-2 text-sm font-medium rounded-md border disabled:opacity-40"
          >
            ← Anterior
          </button>
          {secao < SECOES.length - 1 ? (
            <button
              onClick={() => setSecao((s) => Math.min(SECOES.length - 1, s + 1))}
              className="btn-primary px-4 py-2 text-sm font-semibold rounded-md"
            >
              Próximo →
            </button>
          ) : (
            <button
              onClick={salvar}
              disabled={saving}
              className="btn-accent px-4 py-2 text-sm font-semibold rounded-md disabled:opacity-60"
            >
              {saving ? "Salvando..." : "✓ Salvar Cadastro"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
