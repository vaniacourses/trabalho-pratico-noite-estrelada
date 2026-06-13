"use client";

import {Exemplar} from "@prisma/client";
import {formatDate} from "@/utils/helpers.ts";
import Link from "next/link";
import {useState, useEffect} from "react";
import {exemplarStateTranslate} from "@/domain/translation.ts";
import {useParams} from "next/navigation";

interface AlertState {
    show: boolean;
    message: string;
    tipo: 'sucesso' | 'erro';
}

export default function ExemplarListPage() {
    const params = useParams();
    const midiaId = params?.id as string;

    const [exemplares, setExemplares] = useState<Exemplar[]>([]);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [alert, setAlert] = useState<AlertState>({show: false, message: '', tipo: 'sucesso'});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchExemplares();
    }, [midiaId]);

    useEffect(() => {
        const message = sessionStorage.getItem('successMessage');

        if (message) {
            setAlert({
                show: true,
                message,
                tipo: 'sucesso',
            });

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
                setAlert({
                    show: true,
                    message: data.erro?.mensagem || 'Erro ao carregar exemplares',
                    tipo: 'erro'
                });
            }
        } catch (erro: any) {
            setAlert({
                show: true,
                message: erro.message || 'Erro ao carregar exemplares',
                tipo: 'erro'
            });
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
                setAlert({
                    show: true,
                    message: data.mensagem || 'Exemplar deletado com sucesso',
                    tipo: 'sucesso'
                });
            } else {
                setAlert({
                    show: true,
                    message: data.erro?.mensagem || 'Erro ao deletar exemplar',
                    tipo: 'erro'
                });
            }
        } catch (erro: any) {
            setAlert({
                show: true,
                message: erro.message || 'Erro ao deletar exemplar',
                tipo: 'erro'
            });
        } finally {
            setLoadingId(null);
        }
    };

    if (isLoading) {
        return (
            <main className="flex justify-center items-center min-h-screen">
                <div className="spinner-border" role="status">
                    <span className="sr-only">Carregando...</span>
                </div>
            </main>
        );
    }

    return (
        <main>
            {alert.show && (
                <div
                    className={`mx-6 mb-4 p-4 rounded border-l-4 flex items-center justify-between ${
                        alert.tipo === 'sucesso' ? `alert-success` : `alert-fail`
                    }`}
                    role="alert"
                >
                    <div className="flex items-center">
                        {alert.tipo === 'sucesso' ? (
                            <span className="mr-3 text-lg font-bold">✓</span>
                        ) : (
                            <span className="mr-3 text-lg font-bold">✕</span>
                        )}
                        <span>{alert.message}</span>
                    </div>
                    <button
                        type="button"
                        className={`ml-4 text-lg font-bold hover:opacity-70 transition-opacity ${
                            alert.tipo === 'sucesso' ? 'text-green-700' : 'text-red-700'
                        }`}
                        onClick={() => setAlert(prev => ({...prev, show: false}))}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>
            )}
            <div>
                <h1 className="text-3xl text-center font-bold mt-6">
                    Lista de Exemplares
                </h1>
                <div className={"items-center mb-6"}>
                    <Link href={`/midias/${midiaId}/exemplares/create`}>
                        <div className={"flex justify-end items-center mb-4 mr-6"}>
                            <button className={"btn-edit"}>Adicionar Exemplar</button>
                        </div>
                    </Link>
                    {exemplares.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            <h1>Nenhum exemplar encontrado.</h1>
                        </div>
                    )}
                    {exemplares.length > 0 && (
                        <div className="bg-white flex justify-center rounded shadow p-6">
                            <table className="border-collapse w-3/4">
                                <thead>
                                <tr className="border-b">
                                    <th className="text-center p-4">Código</th>
                                    <th className="text-center p-4">Estado</th>
                                    <th className="text-center p-4">Data de Criação</th>
                                    <th className="text-center p-4">Data de Atualização</th>
                                    <th className="text-center p-4">Ações</th>
                                </tr>
                                </thead>
                                <tbody>
                                {exemplares.map((exemplar) => (
                                    <tr key={exemplar.id}>
                                        <td className="p-5 text-center">{exemplar.codigo}</td>
                                        <td className="p-5 text-center">{exemplarStateTranslate[exemplar.estado]}</td>
                                        <td className="p-5 text-center">{formatDate(exemplar.dataCriacao)}</td>
                                        <td className="p-5 text-center">{formatDate(exemplar.dataAtualizacao)}</td>
                                        <td className="p-5 text-center">
                                            <Link href={`/midias/${midiaId}/exemplares/${exemplar.id}/edit`}>
                                                <button className="btn-edit mr-6">
                                                    Editar
                                                </button>
                                            </Link>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleExcluir(exemplar.id)}
                                                disabled={loadingId === exemplar.id}
                                            >
                                                {loadingId === exemplar.id ? (
                                                    <>
                                                        Deletando...
                                                    </>
                                                ) : (
                                                    'Excluir'
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <Link href={`/midias/${midiaId}`}>
                <div className={"flex justify-start items-center mb-4 ml-6"}>
                    <button className={"btn-delete"}>Voltar</button>
                </div>
            </Link>
        </main>
    );
}
