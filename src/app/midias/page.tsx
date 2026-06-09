"use client";

import {Midia} from "@prisma/client";
import {formatDate} from "@/src/utils/helpers.ts";
import Link from "next/link";
import {useState, useEffect} from "react";

interface AlertState {
    show: boolean;
    message: string;
    tipo: 'sucesso' | 'erro';
}

export default function MidiasPage() {
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
            setAlert({
                show: true,
                message,
                tipo: 'sucesso',
            });

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
                setAlert({
                    show: true,
                    message: data.erro?.mensagem || 'Erro ao carregar mídias',
                    tipo: 'erro'
                });
            }
        } catch (erro: any) {
            setAlert({
                show: true,
                message: erro.message || 'Erro ao carregar mídias',
                tipo: 'erro'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleExcluir = async (midiaId: string) => {
        setLoadingId(midiaId);

        try {
            const response = await fetch(`/api/midias/${midiaId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok) {
                setMidias(midias.filter(m => m.id !== midiaId));
                setAlert({
                    show: true,
                    message: data.mensagem || 'Mídia deletada com sucesso',
                    tipo: 'sucesso'
                });
            } else {
                setAlert({
                    show: true,
                    message: data.erro?.mensagem || 'Erro ao deletar mídia',
                    tipo: 'erro'
                });
            }
        } catch (erro: any) {
            setAlert({
                show: true,
                message: erro.message || 'Erro ao deletar mídia',
                tipo: 'erro'
            });
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
                    Lista de Mídias
                </h1>
                <div className={"items-center mb-6"}>
                    <Link href={"/midias/create"}>
                        <div className={"flex justify-end items-center mb-4 mr-6"}>
                            <button className={"btn-edit"}>Adicionar Mídia</button>
                        </div>
                    </Link>
                    {midias.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            <h1>Nenhuma mídia encontrada.</h1>
                        </div>
                    )}
                    {midias.length > 0 && (
                        <div className="bg-white flex justify-center rounded shadow p-6">
                            <table className="border-collapse w-3/4">
                                <thead>
                                <tr className="border-b">
                                    <th className="text-center p-4">Título</th>
                                    <th className="text-center p-4">Tipo</th>
                                    <th className="text-center p-4">Data de Criação</th>
                                    <th className="text-center p-4">Exemplares</th>
                                    <th className="text-center p-4">Reservas</th>
                                    <th className="text-center p-4">Ações</th>
                                </tr>
                                </thead>
                                <tbody>
                                {midias.map((midia) => (
                                    <tr key={midia.id}>
                                        <td className="p-5 text-center">{midia.titulo}</td>
                                        <td className="p-5 text-center">{midia.tipo}</td>
                                        <td className="p-5 text-center">{formatDate(midia.dataCriacao)}</td>
                                        <td className="p-5 text-center">{midia.exemplares}</td>
                                        <td className="p-5 text-center">{midia.reservas}</td>
                                        <td className="p-5 text-center">
                                            <Link href={`/midias/${midia.id}/edit`}>
                                                <button className="btn-edit mr-6">
                                                    Editar
                                                </button>
                                            </Link>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleExcluir(midia.id)}
                                                disabled={loadingId === midia.id}
                                            >
                                                {loadingId === midia.id ? (
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
        </main>
    );
}