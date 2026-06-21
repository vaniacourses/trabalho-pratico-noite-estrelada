"use client";

import {Exemplar, EstadoExemplar} from "@prisma/client";
import {formatDate} from "@/utils/helpers.ts";
import {useState, useEffect} from "react";
import {exemplarStateTranslate} from "@/domain/translation.ts";
import {useParams, useRouter} from "next/navigation";
import Link from "next/link";
import {AuthenticatedLayout} from "@/components/layout/Layout";
import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/Card";
import {Button} from "@/components/ui/Button";
import {Alert} from "@/components/ui/Alert";

interface AlertState {
    show: boolean;
    message: string;
    tipo: 'sucesso' | 'erro';
}

const TIPOS_FUNCIONARIO = ["ATENDENTE", "GERENTE"];

const estadoColors: Record<string, string> = {
    DISPONIVEL: "bg-brand-success/20 text-brand-success",
    EMPRESTADO: "bg-brand-primary/20 text-brand-primary",
    RESERVADO: "bg-yellow-100 text-yellow-800",
    AFASTADO: "bg-gray-100 text-gray-600",
};

export default function ExemplarListPage() {
    const params = useParams();
    const router = useRouter();
    const midiaId = params?.id as string;

    const [exemplares, setExemplares] = useState<Exemplar[]>([]);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [alert, setAlert] = useState<AlertState>({show: false, message: '', tipo: 'sucesso'});
    const [isLoading, setIsLoading] = useState(true);
    const [isFuncionario, setIsFuncionario] = useState(false);

    // Filtro e paginação
    const [filtroAberto, setFiltroAberto] = useState(false);
    const [filtroCodigo, setFiltroCodigo] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");
    const [pagina, setPagina] = useState(0);
    const [tamanhoPagina, setTamanhoPagina] = useState(3);

    useEffect(() => {
        try {
            const raw = localStorage.getItem("usuario");
            if (raw) {
                const usuario = JSON.parse(raw);
                setIsFuncionario(TIPOS_FUNCIONARIO.includes(usuario.tipo));
            }
        } catch {}
    }, []);

    useEffect(() => {
        fetchExemplares();
    }, [midiaId]);

    useEffect(() => {
        const message = sessionStorage.getItem('successMessage');
        if (message) {
            setAlert({show: true, message, tipo: 'sucesso'});
            sessionStorage.removeItem('successMessage');
        }
    }, []);

    const fetchExemplares = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/midias/${midiaId}/exemplares`);
            const data = await response.json();

            if (response.ok) {
                setExemplares(data.dados || []);
            } else {
                setAlert({show: true, message: data.erro?.mensagem || 'Erro ao carregar exemplares', tipo: 'erro'});
            }
        } catch (erro: any) {
            setAlert({show: true, message: erro.message || 'Erro ao carregar exemplares', tipo: 'erro'});
        } finally {
            setIsLoading(false);
        }
    };

    const handleExcluir = async (exemplarId: string) => {
        setLoadingId(exemplarId);

        try {
            const response = await fetch(`/api/midias/${midiaId}/exemplares/${exemplarId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok) {
                setExemplares(exemplares.filter(e => e.id !== exemplarId));
                setAlert({show: true, message: data.mensagem || 'Exemplar deletado com sucesso', tipo: 'sucesso'});
            } else {
                setAlert({show: true, message: data.erro?.mensagem || 'Erro ao deletar exemplar', tipo: 'erro'});
            }
        } catch (erro: any) {
            setAlert({show: true, message: erro.message || 'Erro ao deletar exemplar', tipo: 'erro'});
        } finally {
            setLoadingId(null);
        }
    };

    if (isLoading) {
        return (
            <AuthenticatedLayout title="Lista de Exemplares">
                <div className="flex justify-center items-center py-20 text-brand-secondary">
                    Carregando...
                </div>
            </AuthenticatedLayout>
        );
    }

    const filtrado = exemplares.filter(e => {
        const matchCodigo = !filtroCodigo || (e.codigo ?? "").toLowerCase().includes(filtroCodigo.toLowerCase());
        const matchEstado = !filtroEstado || e.estado === filtroEstado;
        return matchCodigo && matchEstado;
    });

    const totalPaginas = Math.ceil(filtrado.length / tamanhoPagina);
    const pagina_ = Math.min(pagina, Math.max(0, totalPaginas - 1));
    const paginaInicio = pagina_ * tamanhoPagina;
    const paginado = filtrado.slice(paginaInicio, paginaInicio + tamanhoPagina);

    return (
        <AuthenticatedLayout title="Lista de Exemplares" subtitle="Exemplares físicos desta mídia no acervo">
            <button
                onClick={() => router.push(`/midias/${midiaId}`)}
                className="flex items-center gap-1 mb-4 text-sm text-brand-secondary hover:text-brand-text transition-colors"
            >
                ← Voltar
            </button>

            {alert.show && (
                <div className="mb-6">
                    <Alert
                        variant={alert.tipo === 'sucesso' ? 'success' : 'error'}
                        message={alert.message}
                        onClose={() => setAlert(prev => ({...prev, show: false}))}
                    />
                </div>
            )}

            <Card className="shadow-premium">
                <CardHeader>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <CardTitle>Exemplares</CardTitle>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setFiltroAberto(v => !v)}
                                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded border transition-colors shadow-soft ${
                                    filtroAberto || filtroEstado || filtroCodigo
                                        ? "bg-brand-primary text-white border-brand-primary"
                                        : "border-brand-secondary/30 text-brand-secondary hover:bg-brand-bg"
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                                </svg>
                                Filtrar
                                {(filtroEstado || filtroCodigo) && <span className="ml-1 bg-white/30 rounded-full px-1.5">•</span>}
                            </button>
                            {isFuncionario && (
                                <Link href={`/midias/${midiaId}/exemplares/create`}>
                                    <Button variant="primary" size="sm">Adicionar Exemplar</Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Painel de filtros */}
                    {filtroAberto && (
                        <div className="mt-4 p-4 bg-brand-bg rounded-lg flex flex-wrap gap-4 items-end">
                            <div className="flex-1 min-w-[160px]">
                                <label className="block text-xs font-semibold text-brand-text mb-1">Código</label>
                                <input
                                    type="text"
                                    value={filtroCodigo}
                                    onChange={e => { setFiltroCodigo(e.target.value); setPagina(0); }}
                                    placeholder="Código do exemplar..."
                                    className="w-full h-10 px-3 text-sm border border-brand-secondary/30 rounded bg-white text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                                />
                            </div>
                            <div className="flex-1 min-w-[140px]">
                                <label className="block text-xs font-semibold text-brand-text mb-1">Estado</label>
                                <select
                                    value={filtroEstado}
                                    onChange={e => { setFiltroEstado(e.target.value); setPagina(0); }}
                                    className="w-full h-10 px-3 text-sm border border-brand-secondary/30 rounded bg-white text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                                >
                                    <option value="">Todos</option>
                                    <option value="DISPONIVEL">Disponível</option>
                                    <option value="EMPRESTADO">Emprestado</option>
                                    <option value="RESERVADO">Reservado</option>
                                    <option value="AFASTADO">Afastado</option>
                                </select>
                            </div>
                            <button
                                onClick={() => { setFiltroCodigo(""); setFiltroEstado(""); setPagina(0); }}
                                className="text-xs text-brand-secondary hover:text-brand-text underline pb-1"
                            >
                                Limpar filtros
                            </button>
                        </div>
                    )}
                </CardHeader>

                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-brand-secondary/20">
                                    <th className="text-left py-2 px-4 text-brand-secondary font-semibold">Código</th>
                                    <th className="text-left py-2 px-4 text-brand-secondary font-semibold">Estado</th>
                                    <th className="text-left py-2 px-4 text-brand-secondary font-semibold">Data de Criação</th>
                                    <th className="text-left py-2 px-4 text-brand-secondary font-semibold">Data de Atualização</th>
                                    <th className="text-right py-2 px-4 text-brand-secondary font-semibold">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginado.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-6 text-center text-sm text-brand-secondary/60">
                                            {filtrado.length === 0 && exemplares.length > 0
                                                ? "Nenhum resultado para os filtros aplicados."
                                                : "Nenhum exemplar encontrado."}
                                        </td>
                                    </tr>
                                ) : paginado.map((exemplar) => (
                                    <tr key={exemplar.id} className="border-b border-brand-bg hover:bg-brand-bg/50 transition-colors">
                                        <td className="py-3 px-4 font-medium text-brand-text">{exemplar.codigo}</td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${estadoColors[exemplar.estado] ?? "bg-gray-100 text-gray-600"}`}>
                                                {exemplarStateTranslate[exemplar.estado as EstadoExemplar]}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-brand-text">{formatDate(exemplar.dataCriacao)}</td>
                                        <td className="py-3 px-4 text-brand-text">{formatDate(exemplar.dataAtualizacao)}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex flex-wrap items-center justify-end gap-2">
                                                <Link href={`/midias/${midiaId}/exemplares/${exemplar.id}`}>
                                                    <Button variant="outline" size="sm">Visualizar</Button>
                                                </Link>
                                                {isFuncionario && (
                                                    <>
                                                        <Link href={`/midias/${midiaId}/exemplares/${exemplar.id}/edit`}>
                                                            <Button variant="outline" size="sm">Editar</Button>
                                                        </Link>
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            loading={loadingId === exemplar.id}
                                                            onClick={() => handleExcluir(exemplar.id)}
                                                            className="!bg-brand-error hover:!bg-brand-error/90"
                                                        >
                                                            Excluir
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Rodapé: tamanho de página + paginação */}
                    <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-2 text-xs text-brand-secondary">
                            <span>Por página:</span>
                            <select
                                value={tamanhoPagina}
                                onChange={e => { setTamanhoPagina(Number(e.target.value)); setPagina(0); }}
                                className="px-2 py-1 border border-brand-secondary/30 rounded bg-white text-brand-text text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                            >
                                <option value={3}>3</option>
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-brand-secondary">
                            <span>{filtrado.length === 0 ? "0" : paginaInicio + 1}–{Math.min(paginaInicio + tamanhoPagina, filtrado.length)} de {filtrado.length}</span>
                            <button
                                onClick={() => setPagina(p => Math.max(0, p - 1))}
                                disabled={pagina_ === 0}
                                className="px-2.5 py-1 rounded border border-brand-secondary/30 hover:bg-brand-bg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                ‹
                            </button>
                            <button
                                onClick={() => setPagina(p => Math.min(totalPaginas - 1, p + 1))}
                                disabled={pagina_ >= totalPaginas - 1}
                                className="px-2.5 py-1 rounded border border-brand-secondary/30 hover:bg-brand-bg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                ›
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
