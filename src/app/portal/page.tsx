"use client";

import { useEffect, useRef, useState } from "react";
import { AuthenticatedLayout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipo: string;
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

interface Solicitacao {
  id: string;
  estado: string;
  dataExpiracao: string;
  midia?: { titulo: string };
}

export default function PortalPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [autorizado, setAutorizado] = useState(false);

  // busca de mídia
  const [midias, setMidias] = useState<Midia[]>([]);
  const [busca, setBusca] = useState("");
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [midiaSelecionada, setMidiaSelecionada] = useState<Midia | null>(null);
  const [idExemplar, setIdExemplar] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // submit
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("usuario");
      if (!raw) { window.location.replace("/login?contexto=leitor"); return; }
      const u = JSON.parse(raw) as Usuario;
      if (u.tipo !== "LEITOR") { window.location.replace("/login?contexto=leitor"); return; }
      setUsuario(u);
      setAutorizado(true);
    } catch {
      localStorage.removeItem("usuario");
      window.location.replace("/login?contexto=leitor");
    }
  }, []);

  function carregarMidias() {
    fetch("/api/midias")
      .then((r) => r.json())
      .then((d) => { if (d.sucesso) setMidias(d.dados); })
      .catch(() => {});
  }

  useEffect(() => { carregarMidias(); }, []);

  // fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setDropdownAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const midiasFiltradas = busca.trim().length === 0
    ? midias.slice(0, 8)
    : midias.filter((m) => m.titulo.toLowerCase().includes(busca.toLowerCase())).slice(0, 8);

  function selecionarMidia(m: Midia) {
    setMidiaSelecionada(m);
    setBusca(m.titulo);
    setDropdownAberto(false);
    setIdExemplar("");
  }

  const exemplaresDisponiveis = midiaSelecionada
    ? midiaSelecionada.exemplares.filter((e) => e.estado === "DISPONIVEL")
    : [];

  async function handleSolicitar(e: React.FormEvent) {
    e.preventDefault();
    if (!midiaSelecionada) { setErrorMessage("Selecione uma mídia"); return; }
    if (!idExemplar) { setErrorMessage("Selecione um exemplar disponível"); return; }
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await fetch("/api/emprestimos/solicitar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idLeitor: usuario!.id, idExemplar }),
      });
      const data = await response.json();
      if (!response.ok || !data.sucesso) {
        setErrorMessage(data.erro?.mensagem || "Erro ao solicitar empréstimo");
        return;
      }
      setSuccessMessage(`Solicitação de "${midiaSelecionada.titulo}" enviada! Aguarde a aprovação.`);
      setSolicitacoes((prev) => [...prev, { ...data.dados, midia: { titulo: midiaSelecionada.titulo } }]);
      carregarMidias();
      setBusca("");
      setMidiaSelecionada(null);
      setIdExemplar("");
    } catch {
      setErrorMessage("Erro ao conectar com o servidor");
    } finally {
      setIsLoading(false);
    }
  }

  const estadoBadge: Record<string, string> = {
    PENDENTE: "bg-yellow-100 text-yellow-800",
    CORRENTE: "bg-green-100 text-green-800",
    REJEITADO: "bg-red-100 text-red-800",
    FINALIZADO: "bg-gray-100 text-gray-600",
    ATRASADO: "bg-orange-100 text-orange-800",
  };

  if (!autorizado || !usuario) return null;

  return (
    <AuthenticatedLayout title="Portal do Leitor" subtitle={`Bem-vindo, ${usuario.nome}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Formulário de solicitação */}
        <Card className="shadow-premium">
          <CardHeader>
            <CardTitle>Solicitar Empréstimo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSolicitar} className="space-y-4">

              {/* Busca por nome da mídia */}
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1">
                  Nome da Mídia
                </label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={busca}
                    onChange={(e) => {
                      setBusca(e.target.value);
                      setMidiaSelecionada(null);
                      setIdExemplar("");
                      setDropdownAberto(true);
                    }}
                    onFocus={() => setDropdownAberto(true)}
                    placeholder="Digite o nome do livro, DVD ou CD..."
                    disabled={isLoading}
                    className="w-full px-4 py-2 border border-brand-primary/30 rounded-lg bg-white text-brand-text placeholder-brand-text/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                  />
                  {dropdownAberto && midiasFiltradas.length > 0 && (
                    <div
                      ref={dropdownRef}
                      className="absolute z-50 w-full mt-1 bg-white border border-brand-primary/20 rounded-lg shadow-lg max-h-56 overflow-y-auto"
                    >
                      {midiasFiltradas.map((m) => {
                        const disponiveis = m.exemplares.filter((ex) => ex.estado === "DISPONIVEL").length;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => selecionarMidia(m)}
                            className="w-full text-left px-4 py-2.5 hover:bg-brand-bg flex items-center justify-between gap-2 border-b border-brand-primary/10 last:border-0"
                          >
                            <span className="font-medium text-brand-text text-sm truncate">{m.titulo}</span>
                            <span className={`text-xs px-2 py-0.5 rounded shrink-0 ${disponiveis > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                              {disponiveis > 0 ? `${disponiveis} disponível` : "indisponível"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-brand-text/50">Digite para filtrar ou clique para ver todas</p>
              </div>

              {/* Seleção do exemplar */}
              {midiaSelecionada && (
                <div>
                  <label className="block text-sm font-medium text-brand-text mb-1">
                    Exemplar
                  </label>
                  {exemplaresDisponiveis.length === 0 ? (
                    <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                      Nenhum exemplar disponível no momento para esta mídia.
                    </p>
                  ) : (
                    <select
                      value={idExemplar}
                      onChange={(e) => setIdExemplar(e.target.value)}
                      disabled={isLoading}
                      className="w-full px-4 py-2 border border-brand-primary/30 rounded-lg bg-white text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                    >
                      <option value="">Selecione um exemplar...</option>
                      {exemplaresDisponiveis.map((ex, i) => (
                        <option key={ex.id} value={ex.id}>
                          Exemplar #{i + 1}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {successMessage && <Alert variant="success" message={successMessage} />}
              {errorMessage && (
                <Alert variant="error" title="Erro" message={errorMessage} onClose={() => setErrorMessage(null)} />
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={isLoading}
                disabled={!midiaSelecionada || !idExemplar || exemplaresDisponiveis.length === 0}
              >
                Enviar Solicitação
              </Button>
            </form>

            <div className="mt-4 p-3 bg-brand-bg rounded-lg text-sm text-brand-text/70">
              <p className="font-medium mb-1">Como funciona:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Digite o nome da mídia e selecione no dropdown</li>
                <li>Escolha um exemplar disponível</li>
                <li>Um funcionário irá aprovar ou rejeitar</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Dados do leitor */}
        <Card className="shadow-premium">
          <CardHeader>
            <CardTitle>Meus Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-brand-text/60 font-medium">Nome</p>
              <p className="font-semibold">{usuario.nome}</p>
            </div>
            <div>
              <p className="text-brand-text/60 font-medium">Email</p>
              <p>{usuario.email}</p>
            </div>
            <div>
              <p className="text-brand-text/60 font-medium">Perfil</p>
              <span className="inline-block bg-brand-primary/20 text-brand-primary px-3 py-1 rounded text-xs font-semibold">
                {usuario.tipo}
              </span>
            </div>
            <div className="pt-2">
              <a href="/midias" className="text-brand-primary text-sm underline">
                Explorar mídias disponíveis →
              </a>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Histórico de solicitações desta sessão */}
      {solicitacoes.length > 0 && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Solicitações desta Sessão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {solicitacoes.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-brand-bg rounded-lg text-sm">
                    <div>
                      <p className="font-semibold text-brand-text">{s.midia?.titulo ?? "—"}</p>
                      <p className="text-brand-text/60 mt-0.5 text-xs">
                        Devolução até: {new Date(s.dataExpiracao).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded text-xs font-semibold ${estadoBadge[s.estado] ?? ""}`}>
                      {s.estado}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AuthenticatedLayout>
  );
}
