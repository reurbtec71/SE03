"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MUNICIPIOS, UFS, CONTAGEM_OPCOES, NACIONALIDADE_OPCOES, SEXO_OPCOES,
  ESTADO_CIVIL_OPCOES, ESCOLARIDADE_OPCOES, SITUACAO_EMPREGO_OPCOES,
  TEMPO_OCUPACAO_OPCOES, FORMA_AQUISICAO_OPCOES, TIPO_CONTRATO_OPCOES,
  PAVIMENTOS_OPCOES, MATERIAL_PAREDES_OPCOES, MATERIAL_COBERTURA_OPCOES,
  MATERIAL_PISO_OPCOES, ESTADO_CONSERVACAO_OPCOES, TIPO_USO_OPCOES,
  AGUA_OPCOES, ESGOTO_OPCOES, ENERGIA_OPCOES, COLETA_LIXO_OPCOES,
  PAVIMENTACAO_OPCOES, TIPO_RISCO_OPCOES, CONDICAO_HABITACIONAL_OPCOES,
  CADASTRADORAS,
} from "@/lib/constants";
import { maskCPF } from "@/lib/format";

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

// Campo de texto livre com maiúsculas automáticas (nomes, endereços, descrições)
function UpperInput({
  value, onChange, textarea, placeholder,
}: { value: string; onChange: (v: string) => void; textarea?: boolean; placeholder?: string }) {
  if (textarea) {
    return (
      <textarea
        className={inputClass}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
      />
    );
  }
  return (
    <input
      className={inputClass}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value.toUpperCase())}
    />
  );
}

function CpfInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      className={inputClass}
      value={value}
      placeholder="000.000.000-00"
      inputMode="numeric"
      maxLength={14}
      onChange={(e) => onChange(maskCPF(e.target.value))}
    />
  );
}

type Anexo = { nome: string; path: string; tamanho: number };

function AttachmentUploader({
  cadastroId, anexos, onChange, podeRemover,
}: { cadastroId: string; anexos: Anexo[]; onChange: (a: Anexo[]) => void; podeRemover: boolean }) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setEnviando(true);
    setErro("");
    try {
      const form = new FormData();
      Array.from(files).forEach((f) => form.append("files", f));
      const res = await fetch(`/api/anexos/${cadastroId}`, { method: "POST", body: form });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setErro(body.error || "Erro ao enviar arquivo(s).");
        return;
      }
      const body = await res.json();
      onChange(body.anexos);
    } finally {
      setEnviando(false);
    }
  }

  async function remover(path: string) {
    const res = await fetch(`/api/anexos/${cadastroId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
    });
    if (res.ok) {
      const body = await res.json();
      onChange(body.anexos);
    }
  }

  return (
    <div>
      <input
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,image/*"
        capture="environment"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={enviando}
        className="text-sm mb-2"
      />
      <p className="text-xs text-gray-400 mb-2">
        No celular, essa opção também abre a câmera para foto direto na visita.
      </p>
      {enviando && <p className="text-xs text-gray-500">Enviando...</p>}
      {erro && <p className="text-xs text-red-600">{erro}</p>}
      {anexos.length > 0 && (
        <ul className="text-sm mt-2 space-y-1">
          {anexos.map((a) => (
            <li key={a.path} className="flex items-center justify-between bg-gray-50 border rounded px-2 py-1">
              <span className="truncate">{a.nome}</span>
              {podeRemover && (
                <button
                  type="button"
                  onClick={() => remover(a.path)}
                  className="text-red-600 text-xs font-semibold ml-2"
                >
                  remover
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilePickerLocal({
  arquivos, onChange,
}: { arquivos: File[]; onChange: (f: File[]) => void }) {
  function adicionar(files: FileList | null) {
    if (!files || files.length === 0) return;
    onChange([...arquivos, ...Array.from(files)]);
  }
  function remover(idx: number) {
    onChange(arquivos.filter((_, i) => i !== idx));
  }
  return (
    <div>
      <input
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,image/*"
        capture="environment"
        onChange={(e) => {
          adicionar(e.target.files);
          e.target.value = "";
        }}
        className="text-sm mb-2"
      />
      <p className="text-xs text-gray-400 mb-2">
        No celular, essa opção também abre a câmera para foto direto na visita.
        Os arquivos são enviados junto quando você clicar em &quot;Salvar Cadastro&quot;.
      </p>
      {arquivos.length > 0 && (
        <ul className="text-sm mt-2 space-y-1">
          {arquivos.map((f, i) => (
            <li key={`${f.name}_${i}`} className="flex items-center justify-between bg-gray-50 border rounded px-2 py-1">
              <span className="truncate">{f.name}</span>
              <button
                type="button"
                onClick={() => remover(i)}
                className="text-red-600 text-xs font-semibold ml-2"
              >
                remover
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function CadastroForm({ initialData, cadastroId }: Props) {
  const router = useRouter();
  const [secao, setSecao] = useState(0);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [d, setD] = useState<Record<string, unknown>>(initialData || {});
  const [savedId, setSavedId] = useState<string | undefined>(cadastroId);
  const [arquivosPendentes, setArquivosPendentes] = useState<File[]>([]);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((b) => setRole(b.role))
      .catch(() => {});
  }, []);

  function set(key: string, value: unknown) {
    setD((prev) => ({ ...prev, [key]: value }));
    setSucesso(false);
  }
  const v = (key: string) => (d[key] as string) ?? "";
  const vb = (key: string) => (d[key] as boolean) ?? false;

  async function salvar() {
    setSaving(true);
    setErro("");
    setSucesso(false);
    try {
      const url = savedId ? `/api/cadastros/${savedId}` : "/api/cadastros";
      const method = savedId ? "PUT" : "POST";
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
      const body = await res.json();
      const novoId = body.data.id as string;

      if (arquivosPendentes.length > 0) {
        const form = new FormData();
        arquivosPendentes.forEach((f) => form.append("files", f));
        const resAnexo = await fetch(`/api/anexos/${novoId}`, { method: "POST", body: form });
        if (!resAnexo.ok) {
          const b = await resAnexo.json().catch(() => ({}));
          setErro(
            `Cadastro salvo, mas houve erro ao enviar os anexos: ${b.error || "erro desconhecido"}`
          );
          setSavedId(novoId);
          return;
        }
      }

      if (role === "agente") {
        // Agente não acessa o painel — reseta a tela pronta para o próximo cadastro.
        setD({});
        setSavedId(undefined);
        setArquivosPendentes([]);
        setSecao(0);
        setSucesso(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
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
      {sucesso && (
        <div className="bg-green-50 text-green-800 text-sm font-medium rounded-md px-4 py-2 mb-4 border border-green-200">
          ✓ Cadastro salvo com sucesso (com os anexos, se houver)! Você já pode lançar o próximo.
        </div>
      )}
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
            <Field label="Distrito (2 dígitos)">
              <input className={inputClass} placeholder="00" value={v("distrito")} onChange={(e) => set("distrito", e.target.value)} />
            </Field>
            <Field label="Setor (2 dígitos)">
              <input className={inputClass} placeholder="00" value={v("setor")} onChange={(e) => set("setor", e.target.value)} />
            </Field>
            <Field label="Quadra (3 dígitos)">
              <input className={inputClass} placeholder="000" value={v("quadra")} onChange={(e) => set("quadra", e.target.value)} />
            </Field>
            <Field label="Lote (4 dígitos)">
              <input className={inputClass} placeholder="0000" value={v("lote")} onChange={(e) => set("lote", e.target.value)} />
            </Field>
            <Field label="Sequencial (3 dígitos)">
              <input className={inputClass} placeholder="000" value={v("sequencial")} onChange={(e) => set("sequencial", e.target.value)} />
            </Field>
            <Field label="Logradouro" required>
              <UpperInput value={v("logradouro")} onChange={(x) => set("logradouro", x)} />
            </Field>
            <Field label="Número" required>
              <UpperInput value={v("numero")} onChange={(x) => set("numero", x)} />
            </Field>
            <Field label="Complemento">
              <UpperInput value={v("complemento")} onChange={(x) => set("complemento", x)} />
            </Field>
            <Field label="CEP">
              <input className={inputClass} value={v("cep")} onChange={(e) => set("cep", e.target.value)} />
            </Field>
            <Field label="Data do Cadastro" required>
              <input type="date" className={inputClass} value={v("data_cadastro")} onChange={(e) => set("data_cadastro", e.target.value)} />
            </Field>
            <Field label="Agente de Campo" required>
              <Select value={v("agente_campo")} onChange={(x) => set("agente_campo", x)} options={CADASTRADORAS} />
            </Field>
            <Field label="Coordenador">
              <Select value={v("coordenador")} onChange={(x) => set("coordenador", x)} options={CADASTRADORAS} />
            </Field>
          </>
        )}

        {secao === 1 && (
          <>
            <Field label="Nome Completo" required>
              <UpperInput value={v("nome_completo")} onChange={(x) => set("nome_completo", x)} />
            </Field>
            <Field label="CPF" required>
              <CpfInput value={v("cpf")} onChange={(x) => set("cpf", x)} />
            </Field>
            <Field label="RG / Nº Identidade" required>
              <UpperInput value={v("rg")} onChange={(x) => set("rg", x)} />
            </Field>
            <Field label="Órgão Emissor / UF">
              <UpperInput value={v("orgao_emissor")} onChange={(x) => set("orgao_emissor", x)} />
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
              <UpperInput value={v("naturalidade")} onChange={(x) => set("naturalidade", x)} />
            </Field>
            <Field label="UF de Nascimento" required>
              <Select value={v("uf_nascimento")} onChange={(x) => set("uf_nascimento", x)} options={UFS} />
            </Field>
            <Field label="Filiação — Mãe" required>
              <UpperInput value={v("filiacao_mae")} onChange={(x) => set("filiacao_mae", x)} />
            </Field>
            <Field label="Filiação — Pai">
              <UpperInput value={v("filiacao_pai")} onChange={(x) => set("filiacao_pai", x)} />
            </Field>
            <Field label="Bairro" required>
              <UpperInput value={v("bairro")} onChange={(x) => set("bairro", x)} />
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
              <UpperInput value={v("outras_transferencias")} onChange={(x) => set("outras_transferencias", x)} />
            </Field>
            <Field label="Escolaridade do Responsável">
              <Select value={v("escolaridade")} onChange={(x) => set("escolaridade", x)} options={ESCOLARIDADE_OPCOES} />
            </Field>
            <Field label="Situação de Emprego">
              <Select value={v("situacao_emprego")} onChange={(x) => set("situacao_emprego", x)} options={SITUACAO_EMPREGO_OPCOES} />
            </Field>
            <Field label="Profissão">
              <UpperInput value={v("profissao")} onChange={(x) => set("profissao", x)} />
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
              <UpperInput textarea value={v("descricao_conflito")} onChange={(x) => set("descricao_conflito", x)} />
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
              <UpperInput value={v("descricao_uso_misto")} onChange={(x) => set("descricao_uso_misto", x)} />
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
              <UpperInput textarea value={v("outros_documentos")} onChange={(x) => set("outros_documentos", x)} />
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
              <Select value={v("responsavel_coleta")} onChange={(x) => set("responsavel_coleta", x)} options={CADASTRADORAS} />
            </Field>
            <Field label="Observações LGPD">
              <UpperInput textarea value={v("observacoes_lgpd")} onChange={(x) => set("observacoes_lgpd", x)} />
            </Field>
            <div className="mt-4">
              <label className="block text-sm text-gray-700 mb-1">
                📎 Anexar Documentos / Registro Fotográfico (PDF, JPG, PNG)
              </label>
              {savedId ? (
                <AttachmentUploader
                  cadastroId={savedId}
                  anexos={(d.anexos as Anexo[]) || []}
                  onChange={(anexos) => set("anexos", anexos)}
                  podeRemover={role === "coordenador"}
                />
              ) : (
                <FilePickerLocal arquivos={arquivosPendentes} onChange={setArquivosPendentes} />
              )}
            </div>
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
