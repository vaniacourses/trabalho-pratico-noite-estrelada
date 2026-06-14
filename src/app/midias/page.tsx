"use client";

import {Midia} from "@prisma/client";
import {formatDate} from "@/utils/helpers.ts";
import Link from "next/link";
import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import {mediaTranslate} from "@/domain/translation.ts";
import {AuthenticatedLayout} from "@/components/layout/Layout";
import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/Card";
import {Alert} from "@/components/ui/Alert";

interface AlertState {
    show: boolean;
    message: string;
    tipo: 'sucesso' | 'erro';
}

export default function MidiasPage() {
    const router = useRouter();
    const [midias, setMidias] = useState<Midia[]>([]);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [alert, setAlert] = useState<AlertState>({show: false, message: '', tipo: 'sucesso'});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchMidias();
    }, []);

    useEffect(() => {
        const message = sessionStorage.getItem('successMessage');
        if (message) {
            setAlert({show: true, message, tipo: 'sucesso'});
            sessionStorage.removeItem('successMessage');
        }
    }, []);

    const fetchMidias = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/midias');
            const data = await response.json();
            if (response.ok) {
                setMidias(data.dados || []);
            } else {
                setAlert({show: true, message: data.erro?.mensagem || 'Erro ao carregar mídias', tipo: 'erro'});
            }
        } catch (erro: any) {
            setAlert({show: true, message: erro.message || 'Erro ao carregar mídias', tipo: 'erro'});
        } finally {
            setIsLoading(false);
        }
    };

    const handleExcluir = async (midiaId: string) => {
        setLoadingId(midiaId);
        try {
            const response = await fetch(`/api/midias/${midiaId}`, {method: 'DELETE'});
            const data = await response.json();
            if (response.ok) {
                setMidias(midias.filter(m => m.id !== midiaId));
                setAlert({show: true, message: data.mensagem || 'Mídia deletada com sucesso', tipo: 'sucesso'});
            } else {
                setAlert({show: true, message: data.erro?.mensagem || 'Erro ao deletar mídia', tipo: 'erro'});
            }
        } catch (erro: any) {
            setAlert({show: true, message: erro.message || 'Erro ao deletar mídia', tipo: 'erro'});
        } finally {
            setLoadingId(null);
        }
    };

    if (isLoading) {
        return (
            <AuthenticatedLayout title="Lista de Mídias" subtitle="Gerencie o acervo de mídias da biblioteca">
                <div className="flex justify-center items-center py-20">
                    <div className="flex items-center gap-3 text-brand-secondary">
                        <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        <span className="text-sm font-medium">Carregando mídias...</span>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout title="Lista de Mídias" subtitle="Gerencie o acervo de mídias da biblioteca">

            {alert.show && (
                <div className="mb-6">
                    <Alert
                        variant={alert.tipo === 'sucesso' ? 'success' : 'error'}
                        message={alert.message}
                        onClose={() => setAlert(prev => ({...prev, show: false}))}
                    />
                </div>
            )}

            <button
                onClick={() => router.back()}
                className="flex items-center gap-1 mb-4 text-sm text-brand-secondary hover:text-brand-text transition-colors"
            >
                ← Voltar
            </button>

            <Card className="shadow-premium">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Mídias Cadastradas</CardTitle>
                        <Link href="/midias/create">
                            <button className="btn-primary text-sm py-2 px-5 rounded font-semibold shadow-soft transition-colors duration-200">
                                + Adicionar Mídia
                            </button>
                        </Link>
                    </div>
                </CardHeader>

                <CardContent>
                    {midias.length === 0 ? (
                        <div className="py-12 text-center text-brand-secondary">
                            <p className="text-lg font-medium">Nenhuma mídia encontrada.</p>
                            <p className="text-sm mt-1">Adicione uma nova mídia para começar.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                <tr className="border-b border-brand-secondary/20">
                                    <th className="text-left py-3 px-4 text-brand-secondary font-semibold">Título</th>
                                    <th className="text-left py-3 px-4 text-brand-secondary font-semibold">Tipo</th>
                                    <th className="text-left py-3 px-4 text-brand-secondary font-semibold">Data de Criação</th>
                                    <th className="text-right py-3 px-4 text-brand-secondary font-semibold">Ações</th>
                                </tr>
                                </thead>
                                <tbody>
                                {midias.map((midia) => (
                                    <tr key={midia.id} className="border-b border-brand-bg hover:bg-brand-bg/50 transition-colors">
                                        <td className="py-3 px-4 font-medium text-brand-text">{midia.titulo}</td>
                                        <td className="py-3 px-4">
                                            <span className="inline-block bg-brand-primary/15 text-brand-primary px-3 py-1 rounded text-xs font-semibold">
                                                {mediaTranslate[midia.tipo]}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-brand-text/70">{formatDate(midia.dataCriacao)}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/midias/${midia.id}`}>
                                                    <button className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700 transition-colors">
                                                        Visualizar
                                                    </button>
                                                </Link>
                                                <Link href={`/midias/${midia.id}/exemplares/create`}>
                                                    <button className="px-3 py-1.5 bg-brand-primary text-white text-xs font-semibold rounded hover:bg-brand-primary-dark transition-colors">
                                                        + Exemplar
                                                    </button>
                                                </Link>
                                                <button
                                                    className="px-3 py-1.5 bg-brand-error text-white text-xs font-semibold rounded hover:opacity-90 transition-colors disabled:opacity-50"
                                                    onClick={() => handleExcluir(midia.id)}
                                                    disabled={loadingId === midia.id}
                                                >
                                                    {loadingId === midia.id ? '...' : 'Excluir'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
