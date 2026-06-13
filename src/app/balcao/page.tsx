"use client";

import { useState, useEffect, useRef } from "react";
import { AuthenticatedLayout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";

interface Leitor {
  id: string;
  nome: string;
  email: string | null;
  tipo: string;
  estado: string;
}

interface Exemplar {
  id: string;
  estado: string;
}

interface Midia {
  id: string;
  titulo: string;
  tipo: string;
  exemplares: Exemplar[];
}

interface EmprestimoRealizado {
  id: string;
  idLeitor: string;
  idExemplar: string;
  dataInicio: string;
  dataExpiracao: string;
  estado: string;
}

// ──────────────────────────────────────────────
// Componente de busca reutilizável com dropdown
// ──────────────────────────────────────────────
function BuscaDropdown<T>({
  label,
  placeholder,
  busca,
  onBuscaChange,
  opcoes,
  renderOpcao,
  onSelecionar,
  aberto,
  onAbrir,
  onFechar,
  inputRef,
  dropdownRef,
  disabled,
}: {
  label: string;
  placeholder: string;
  busca: string;
  onBuscaChange: (v: string) => void;
  opcoes: T[];
  renderOpcao: (item: T) => React.ReactNode;
  onSelecionar: (item: T) => void;
  aberto: boolean;
  onAbrir: () => void;
  onFechar: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  dropdownRef: React.RefObject<HTMLDivElement>;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-brand-text mb-1">{label}</label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={busca}
          onChange={(e) => { onBuscaChange(e.target.value); onAbrir(); }}
          onFocus={onAbrir}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-2 border border-brand-primary/30 rounded-lg bg-white text-brand-text placeholder-brand-text/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 disabled:opacity-50"
        />
        {aberto && opcoes.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-brand-primary/20 rounded-lg shadow-lg max-h-56 overflow-y-auto"
          >
            {opcoes.map((item, i) => (
              <button
                key={i}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); onSelecionar(item); onFechar(); }}
                className="w-full text-left px-4 py-2.5 hover:bg-brand-bg border-b border-brand-primary/10 last:border-0"
              >
                {renderOpcao(item)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Página principal
// ──────────────────────────────────────────────
export default function BalcaoPage() {
  const [autorizado, setAutorizado] = useState(false);

  // dados carregados
  const [leitores, setLeitores] = useState<Leitor[]>([]);
  const [midias, setMidias] = useState<Midia[]>([]);

  // busca leitor
  const [buscaLeitor, setBuscaLeitor] = useState("");
  const [leitorSelecionado, setLeitorSelecionado] = useState<Leitor | null>(null);
  const [dropdownLeitorAberto, setDropdownLeitorAberto] = useState(false);
  const inputLeitorRef = useRef<HTMLInputElement>(null);
  const dropdownLeitorRef = useRef<HTMLDivElement>(null);

  // busca mídia
  const [buscaMidia, setBuscaMidia] = useState("");
  const [midiaSelecionada, setMidiaSelecionada] = useState<Midia | null>(null);
  const [idExemplar, setIdExemplar] = useState("");
  const [dropdownMidiaAberto, setDropdownMidiaAberto] = useState(false);
  const inputMidiaRef = useRef<HTMLInputElement>(null);
  const dropdownMidiaRef = useRef<HTMLDivElement>(null);

  // submit
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emprestimoRealizado, setEmprestimoRealizado] = useState<EmprestimoRealizado | null>(null);

  // auth
  useEffect(() => {
    try {
      const raw = localStorage.getItem("usuario");
      if (!raw) { window.location.replace("/login?contexto=funcionario&redirect=/balcao"); return; }
      const usuario = JSON.parse(raw);
      if (usuario.tipo !== "ATENDENTE" && usuario.tipo !== "GERENTE") {
        localStorage.removeItem("usuario");
        window.location.replace("/login?contexto=funcionario&redirect=/balcao");
        return;
      }
      setAutorizado(true);
    } catch {
      localStorage.removeItem("usuario");
      window.location.replace("/login?contexto=funcionario&redirect=/balcao");
    }
  }, []);

  // carregar dados
  function carregarMidias() {
    fetch("/api/midias").then(r => r.json()).then(d => { if (d.sucesso) setMidias(d.dados); }).catch(() => {});
  }

  useEffect(() => {
    fetch("/api/leitores").then(r => r.json()).then(d => { if (d.sucesso) setLeitores(d.dados); }).catch(() => {});
    carregarMidias();
  }, []);

  // fechar dropdowns ao clicar fora
  useEffect(() => {
    function handler(e: MouseEvent) {
      const t = e.target as Node;
      if (inputLeitorRef.current && !inputLeitorRef.current.contains(t) &&
          dropdownLeitorRef.current && !dropdownLeitorRef.current.contains(t)) {
        setDropdownLeitorAberto(false);
      }
      if (inputMidiaRef.current && !inputMidiaRef.current.contains(t) &&
          dropdownMidiaRef.current && !dropdownMidiaRef.current.contains(t)) {
        setDropdownMidiaAberto(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // filtros
  const leitoresFiltrados = leitores
    .filter(l => l.tipo === "LEITOR" && (
      buscaLeitor.trim() === "" || l.nome.toLowerCase().includes(buscaLeitor.toLowerCase()) ||
      (l.email ?? "").toLowerCase().includes(buscaLeitor.toLowerCase())
    ))
    .slice(0, 8);

  const midiasFiltradas = midias
    .filter(m => buscaMidia.trim() === "" || m.titulo.toLowerCase().includes(buscaMidia.toLowerCase()))
    .slice(0, 8);

  const exemplaresDisponiveis = midiaSelecionada
    ? midiaSelecionada.exemplares.filter(e => e.estado === "DISPONIVEL")
    : [];

  function selecionarLeitor(l: Leitor) {
    setLeitorSelecionado(l);
    setBuscaLeitor(l.nome);
  }

  function selecionarMidia(m: Midia) {
    setMidiaSelecionada(m);
    setBuscaMidia(m.titulo);
    setIdExemplar("");
  }

  function limpar() {
    setBuscaLeitor(""); setLeitorSelecionado(null);
    setBuscaMidia(""); setMidiaSelecionada(null); setIdExemplar("");
    setSuccessMessage(null); setErrorMessage(null); setEmprestimoRealizado(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!leitorSelecionado) { setErrorMessage("Selecione um leitor"); return; }
    if (!midiaSelecionada) { setErrorMessage("Selecione uma mídia"); return; }
    if (!idExemplar) { setErrorMessage("Selecione um exemplar disponível"); return; }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setEmprestimoRealizado(null);

    try {
      const response = await fetch("/api/emprestimos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idLeitor: leitorSelecionado.id, idExemplar, diasEmprestimo: 14 }),
      });
      const data = await response.json();
      if (!response.ok || !data.sucesso) {
        setErrorMessage(data.erro?.mensagem || "Erro ao realizar empréstimo");
        return;
      }
      setEmprestimoRealizado(data.dados);
      setSuccessMessage(`Empréstimo de "${midiaSelecionada.titulo}" para ${leitorSelecionado.nome} realizado!`);
      carregarMidias();
      limpar();
      setTimeout(() => { setSuccessMessage(null); setEmprestimoRealizado(null); }, 6000);
    } catch {
      setErrorMessage("Erro ao conectar com o servidor");
    } finally {
      setIsLoading(false);
    }
  }

  if (!autorizado) return null;

  return (
    <AuthenticatedLayout title="Balcão de Atendimento" subtitle="Realize empréstimos de exemplares">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Formulário */}
        <div className="lg:col-span-2">
          <Card className="shadow-premium">
            <CardHeader>
              <CardTitle>Novo Empréstimo</CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Busca por leitor */}
                <BuscaDropdown<Leitor>
                  label="Leitor"
                  placeholder="Digite o nome ou email do leitor..."
                  busca={buscaLeitor}
                  onBuscaChange={(v) => { setBuscaLeitor(v); setLeitorSelecionado(null); }}
                  opcoes={leitoresFiltrados}
                  renderOpcao={(l) => (
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-brand-text">{l.nome}</p>
                        <p className="text-xs text-brand-text/50">{l.email ?? "—"}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded shrink-0 ${l.estado === "REGULAR" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {l.estado}
                      </span>
                    </div>
                  )}
                  onSelecionar={selecionarLeitor}
                  aberto={dropdownLeitorAberto}
                  onAbrir={() => setDropdownLeitorAberto(true)}
                  onFechar={() => setDropdownLeitorAberto(false)}
                  inputRef={inputLeitorRef}
                  dropdownRef={dropdownLeitorRef}
                  disabled={isLoading}
                />

                {/* Confirmação do leitor selecionado */}
                {leitorSelecionado && (
                  <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 flex items-center gap-2">
                    <span className="font-semibold">{leitorSelecionado.nome}</span>
                    <span className="text-green-600">selecionado</span>
                    <button type="button" onClick={() => { setBuscaLeitor(""); setLeitorSelecionado(null); }} className="ml-auto text-green-500 hover:text-green-700">✕</button>
                  </div>
                )}

                {/* Busca por mídia */}
                <BuscaDropdown<Midia>
                  label="Mídia"
                  placeholder="Digite o título do livro, DVD ou CD..."
                  busca={buscaMidia}
                  onBuscaChange={(v) => { setBuscaMidia(v); setMidiaSelecionada(null); setIdExemplar(""); }}
                  opcoes={midiasFiltradas}
                  renderOpcao={(m) => {
                    const disp = m.exemplares.filter(e => e.estado === "DISPONIVEL").length;
                    return (
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-brand-text truncate max-w-[280px]">{m.titulo}</p>
                          <p className="text-xs text-brand-text/50">{m.tipo}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded shrink-0 ${disp > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                          {disp > 0 ? `${disp} disponível` : "indisponível"}
                        </span>
                      </div>
                    );
                  }}
                  onSelecionar={selecionarMidia}
                  aberto={dropdownMidiaAberto}
                  onAbrir={() => setDropdownMidiaAberto(true)}
                  onFechar={() => setDropdownMidiaAberto(false)}
                  inputRef={inputMidiaRef}
                  dropdownRef={dropdownMidiaRef}
                  disabled={isLoading}
                />

                {/* Seleção de exemplar */}
                {midiaSelecionada && (
                  exemplaresDisponiveis.length === 0 ? (
                    <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                      Nenhum exemplar disponível para "{midiaSelecionada.titulo}".
                    </p>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-brand-text mb-1">Exemplar</label>
                      <select
                        value={idExemplar}
                        onChange={(e) => setIdExemplar(e.target.value)}
                        disabled={isLoading}
                        className="w-full px-4 py-2 border border-brand-primary/30 rounded-lg bg-white text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                      >
                        <option value="">Selecione um exemplar...</option>
                        {exemplaresDisponiveis.map((ex, i) => (
                          <option key={ex.id} value={ex.id}>Exemplar #{i + 1}</option>
                        ))}
                      </select>
                    </div>
                  )
                )}

                {successMessage && <Alert variant="success" message={successMessage} />}
                {errorMessage && (
                  <Alert variant="error" title="Erro ao realizar empréstimo" message={errorMessage} onClose={() => setErrorMessage(null)} />
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isLoading}
                  disabled={!leitorSelecionado || !midiaSelecionada || !idExemplar}
                  className="w-full"
                >
                  Realizar Empréstimo
                </Button>
              </form>
            </CardContent>

            <CardFooter>
              <Button type="button" variant="outline" onClick={limpar} disabled={isLoading}>
                Limpar
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Painel lateral */}
        <div>
          {emprestimoRealizado ? (
            <Card className="shadow-premium border-l-4 border-brand-success">
              <CardHeader>
                <CardTitle className="text-lg">✓ Empréstimo Realizado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-brand-text/60 font-medium">ID</p>
                  <p className="font-mono text-xs break-all">{emprestimoRealizado.id}</p>
                </div>
                <div>
                  <p className="text-brand-text/60 font-medium">Início</p>
                  <p>{new Date(emprestimoRealizado.dataInicio).toLocaleDateString("pt-BR")}</p>
                </div>
                <div>
                  <p className="text-brand-text/60 font-medium">Devolução</p>
                  <p className="text-brand-primary font-semibold">
                    {new Date(emprestimoRealizado.dataExpiracao).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div>
                  <p className="text-brand-text/60 font-medium">Estado</p>
                  <span className="inline-block bg-brand-success/20 text-brand-success px-3 py-1 rounded text-xs font-semibold">
                    {emprestimoRealizado.estado}
                  </span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="card-secondary">
              <CardHeader>
                <CardTitle className="text-lg">Validações</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-xs text-brand-text/80 space-y-1">
                  <li>✓ Exemplar deve estar DISPONIVEL</li>
                  <li>✓ Leitor em estado REGULAR/INCOMPLETO</li>
                  <li>✓ Máximo 5 empréstimos simultâneos</li>
                  <li>✓ Prazo padrão: 14 dias</li>
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Solicitações Pendentes */}
      <PainelPendentes />

      {/* Histórico mock */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Últimos Empréstimos do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-secondary/20">
                    <th className="text-left py-2 px-4 text-brand-secondary font-semibold">ID Empréstimo</th>
                    <th className="text-left py-2 px-4 text-brand-secondary font-semibold">Leitor</th>
                    <th className="text-left py-2 px-4 text-brand-secondary font-semibold">Estado</th>
                    <th className="text-left py-2 px-4 text-brand-secondary font-semibold">Expiração</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: "emp123...abc1", leitor: "leitor1@example.com", expiracao: "14/06/2026" },
                    { id: "emp223...abc2", leitor: "leitor2@example.com", expiracao: "15/06/2026" },
                    { id: "emp323...abc3", leitor: "leitor3@example.com", expiracao: "16/06/2026" },
                  ].map((row) => (
                    <tr key={row.id} className="border-b border-brand-bg hover:bg-brand-bg/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs">{row.id}</td>
                      <td className="py-3 px-4">{row.leitor}</td>
                      <td className="py-3 px-4">
                        <span className="inline-block bg-brand-primary/20 text-brand-primary px-3 py-1 rounded text-xs font-semibold">CORRENTE</span>
                      </td>
                      <td className="py-3 px-4">{row.expiracao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}

// ──────────────────────────────────────────────
// Painel de solicitações pendentes
// ──────────────────────────────────────────────
interface Pendente {
  id: string;
  dataInicio: string;
  dataExpiracao: string;
  leitor: { id: string; nome: string; email: string };
  exemplar: { id: string; midia: { titulo: string; tipo: string } };
}

function PainelPendentes() {
  const [pendentes, setPendentes] = useState<Pendente[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/emprestimos/pendentes")
      .then((r) => r.json())
      .then((data) => { if (data.sucesso) setPendentes(data.dados); });
  }, []);

  async function handleAcao(id: string, acao: "aprovar" | "rejeitar") {
    setLoadingId(id);
    setFeedback(null);
    try {
      const response = await fetch(`/api/emprestimos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao }),
      });
      const data = await response.json();
      if (!response.ok || !data.sucesso) {
        setFeedback({ id, msg: data.erro?.mensagem || "Erro ao processar", ok: false });
        return;
      }
      setPendentes((prev) => prev.filter((p) => p.id !== id));
      setFeedback({ id, msg: acao === "aprovar" ? "Empréstimo aprovado!" : "Solicitação rejeitada.", ok: true });
    } catch {
      setFeedback({ id, msg: "Erro ao conectar com o servidor", ok: false });
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="mt-8">
      <Card>
        <CardHeader>
          <CardTitle>
            Solicitações Pendentes
            {pendentes.length > 0 && (
              <span className="ml-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                {pendentes.length}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {feedback && (
            <div className={`mb-4 p-3 rounded text-sm font-medium ${feedback.ok ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {feedback.msg}
            </div>
          )}
          {pendentes.length === 0 ? (
            <p className="text-sm text-brand-text/60">Nenhuma solicitação pendente no momento.</p>
          ) : (
            <div className="space-y-3">
              {pendentes.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-brand-bg rounded-lg border border-yellow-200">
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold text-brand-text">
                      {p.exemplar.midia.titulo}
                      <span className="ml-2 text-xs text-brand-secondary">({p.exemplar.midia.tipo})</span>
                    </p>
                    <p className="text-brand-text/70">Leitor: <span className="font-medium">{p.leitor.nome}</span> — {p.leitor.email}</p>
                    <p className="text-brand-text/60 text-xs">
                      Solicitado em {new Date(p.dataInicio).toLocaleDateString("pt-BR")} •
                      Devolução: {new Date(p.dataExpiracao).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4 shrink-0">
                    <button
                      onClick={() => handleAcao(p.id, "aprovar")}
                      disabled={loadingId === p.id}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {loadingId === p.id ? "..." : "Aprovar"}
                    </button>
                    <button
                      onClick={() => handleAcao(p.id, "rejeitar")}
                      disabled={loadingId === p.id}
                      className="px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
                    >
                      {loadingId === p.id ? "..." : "Rejeitar"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
