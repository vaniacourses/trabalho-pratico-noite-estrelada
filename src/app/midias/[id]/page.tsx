"use client"

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import Link from "next/link";
import {Midia, TipoDeMidia} from "@prisma/client";
import {formatDate} from "@/utils/helpers.ts";
import {mediaTranslate} from "@/domain/translation.ts";
import {AuthenticatedLayout} from "@/components/layout/Layout";
import {Card, CardHeader, CardTitle, CardContent, CardFooter} from "@/components/ui/Card";
import {Button} from "@/components/ui/Button";
import {Alert} from "@/components/ui/Alert";

interface AlertState {
    show: boolean;
    message: string;
    tipo: 'sucesso' | 'erro';
}

const TIPOS_FUNCIONARIO = ["ATENDENTE", "GERENTE"];

export default function ViewMidiaPage() {
    const {id} = useParams();
    const router = useRouter();
    const [midiaResp, setMidiaResp] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [alert, setAlert] = useState<AlertState>({show: false, message: '', tipo: 'sucesso'});
    const [isFuncionario, setIsFuncionario] = useState(false);
    const [exemplaresList, setExemplaresList] = useState<any[]>([]);

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
        const message = sessionStorage.getItem('successMessage');
        if (message) {
            setAlert({show: true, message, tipo: 'sucesso'});
            sessionStorage.removeItem('successMessage');
        }
    }, []);

    useEffect(() => {
        if (!id) return;
        const fetchMidia = async () => {
            try {
                setIsLoading(true);
                const r = await fetch(`/api/midias/${id}`);
                const json = await r.json();
                if (!r.ok) {
                    setAlert({show: true, message: json.erro?.mensagem || 'Erro ao carregar mídia', tipo: 'erro'});
                } else {
                    setMidiaResp(json.dados);
                }
            } catch (e: any) {
                setAlert({show: true, message: e.message || 'Erro ao carregar mídia', tipo: 'erro'});
            } finally {
                setIsLoading(false);
            }
        };

        const fetchExemplares = async () => {
            try {
                const r = await fetch(`/api/midias/${id}/exemplares`);
                const json = await r.json();
                if (r.ok) setExemplaresList(json.dados || []);
            } catch (e) {
                // ignore—optional
            }
        };

        fetchMidia();
        fetchExemplares();
    }, [id]);

    const renderDetalhe = (label: string, valor: React.ReactNode) => (
        <div className="flex justify-between gap-4 py-2 border-b border-brand-secondary/10 last:border-0">
            <span className="text-sm font-semibold text-brand-secondary">{label}</span>
            <span className="text-sm text-brand-text text-right">{valor}</span>
        </div>
    );

    function renderDadosEspecificos(midia: Midia) {
        const dados: any = (midia as any).dados || {};
        switch (midia.tipo) {
            case "PUBLICACAO":
                return (
                    <>
                        {renderDetalhe("Autor", dados.autor)}
                        {renderDetalhe("ISBN", dados.isbn)}
                        {renderDetalhe("Páginas", dados.paginas)}
                    </>
                );
            case "CD":
                return (
                    <>
                        {renderDetalhe("Artista", dados.artista)}
                        {renderDetalhe("Faixas", Array.isArray(dados.faixas) ? dados.faixas.join(', ') : dados.faixas)}
                        {renderDetalhe("Duração (min)", dados.duracao)}
                    </>
                );
            case "DVD":
                return (
                    <>
                        {renderDetalhe("Diretor", dados.diretor)}
                        {renderDetalhe("Código de Região", dados.codigoDeRegiao)}
                        {renderDetalhe("Legendas", Array.isArray(dados.legendas) ? dados.legendas.join(', ') : dados.legendas)}
                        {renderDetalhe("Duração (min)", dados.duracao)}
                    </>
                );
            default:
                return null;
        }
    }

    if (isLoading) {
        return (
            <AuthenticatedLayout title="Detalhes da Mídia">
                <div className="flex justify-center items-center py-20 text-brand-secondary">
                    Carregando...
                </div>
            </AuthenticatedLayout>
        );
    }

    if (!midiaResp) {
        return (
            <AuthenticatedLayout title="Detalhes da Mídia">
                <div className="max-w-2xl">
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
                        <CardContent>
                            <p className="text-center text-brand-secondary py-6">Mídia não encontrada.</p>
                        </CardContent>
                        <CardFooter>
                            <Link href="/midias">
                                <Button variant="outline">Voltar à lista</Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </div>
            </AuthenticatedLayout>
        );
    }

    const midia: Midia = midiaResp as Midia;

    return (
        <AuthenticatedLayout title="Detalhes da Mídia" subtitle="Informações completas do acervo">
            <button
                onClick={() => router.back()}
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Informações da mídia */}
                <div className="lg:col-span-2">
                    <Card className="shadow-premium">
                        <CardHeader>
                            <CardTitle>{midia.titulo}</CardTitle>
                            <p className="text-brand-secondary mt-1 text-sm">
                                {mediaTranslate[midia.tipo as TipoDeMidia]}
                            </p>
                        </CardHeader>

                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                                {renderDetalhe("Tipo", mediaTranslate[midia.tipo as TipoDeMidia])}
                                {renderDetalhe("Data de Criação", formatDate(midia.dataCriacao))}
                                {renderDadosEspecificos(midia)}
                            </div>
                        </CardContent>

                        <CardFooter>
                            <Link href="/midias">
                                <Button variant="outline">Voltar</Button>
                            </Link>
                            {isFuncionario && (
                                <Link href={`/midias/${midia.id}/edit`}>
                                    <Button variant="primary">Editar</Button>
                                </Link>
                            )}
                        </CardFooter>
                    </Card>
                </div>

                {/* Ações / exemplares */}
                <div>
                    <Card variant="secondary">
                        <CardHeader>
                            <CardTitle>
                                <span className="text-xl">Exemplares</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-brand-text/70 mb-4">
                                Veja todos os exemplares físicos desta mídia disponíveis no acervo.
                            </p>
                            <div>
                                <div className="mb-4 flex items-center justify-between">
                                    <Link href={`/midias/${midia.id}/exemplares/create`}>
                                        <Button variant="primary" className="">+ Novo Exemplar</Button>
                                    </Link>
                                    <span className="text-sm text-brand-secondary">{exemplaresList.length} exemplares</span>
                                </div>

                                {exemplaresList.length === 0 ? (
                                    <p className="text-sm text-brand-secondary">Nenhum exemplar cadastrado para esta mídia.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-left text-xs text-brand-secondary uppercase">
                                                    <th className="px-3 py-2">Código</th>
                                                    <th className="px-3 py-2">Estado</th>
                                                    <th className="px-3 py-2">Criado</th>
                                                    <th className="px-3 py-2">Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {exemplaresList.map((ex: any) => (
                                                    <tr key={ex.id} className="border-t">
                                                        <td className="px-3 py-2">{ex.codigo}</td>
                                                        <td className="px-3 py-2">{ex.estado}</td>
                                                        <td className="px-3 py-2">{new Date(ex.dataCriacao).toLocaleString('pt-BR')}</td>
                                                        <td className="px-3 py-2">
                                                            <Link href={`/exemplares/${ex.id}`} className="inline-block">
                                                                <button className="text-sm px-3 py-1 rounded border border-brand-secondary/30 hover:bg-brand-bg">Visualizar</button>
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
