"use client";

import {Leitor} from "@prisma/client";
import {formatDate, formatCpf} from "@/utils/helpers.ts";
import Link from "next/link";
import {useState, useEffect} from "react";

interface AlertState {
    show: boolean;
    message: string;
    tipo: 'sucesso' | 'erro';
}

export default function LeitoresPage() {
    const [leitores, setLeitores] = useState<Leitor[]>([]);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [alert, setAlert] = useState<AlertState>({show: false, message: '', tipo: 'sucesso'});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchLeitores();
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

    const fetchLeitores = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/leitores');
            const data = await response.json();

            if (response.ok) {
                setLeitores(data.dados || []);
            } else {
                setAlert({
                    show: true,
                    message: data.erro?.mensagem || 'Erro ao carregar leitores',
                    tipo: 'erro'
                });
            }
        } catch (erro: any) {
            setAlert({
                show: true,
                message: erro.message || 'Erro ao carregar leitores',
                tipo: 'erro'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleExcluir = async (leitorId: string) => {
        setLoadingId(leitorId);

        try {
            const response = await fetch(`/api/leitores/${leitorId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok) {
                // Remove deleted leitor from list
                setLeitores(leitores.filter(l => l.id !== leitorId));
                setAlert({
                    show: true,
                    message: data.mensagem || 'Leitor deletado com sucesso',
                    tipo: 'sucesso'
                });
            } else {
                setAlert({
                    show: true,
                    message: data.erro?.mensagem || 'Erro ao deletar leitor',
                    tipo: 'erro'
                });
            }
        } catch (erro: any) {
            setAlert({
                show: true,
                message: erro.message || 'Erro ao deletar leitor',
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
                    Lista de Leitores
                </h1>
                <div className={"items-center mb-6"}>
                    <Link href={"leitores/create"}>
                        <div className={"flex justify-end items-center mb-4 mr-6"}>
                            <button className={"btn-edit"}>Adicionar Leitor</button>
                        </div>
                    </Link>
                    {leitores.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            <h1>Nenhum leitor encontrado.</h1>
                        </div>
                    )}
                    {leitores.length > 0 && (
                        <div className="bg-white flex justify-center rounded shadow p-6">
                            <table className="border-collapse w-3/4">
                                <thead>
                                <tr className="border-b">
                                    <th className="text-center p-4">Nome</th>
                                    <th className="text-center p-4">Email</th>
                                    <th className="text-center p-4">CPF</th>
                                    <th className="text-center p-4">Data de Nascimento</th>
                                    <th className="text-center p-4">Estado</th>
                                    <th className="text-center p-4">Ações</th>
                                </tr>
                                </thead>
                                <tbody>
                                {leitores.map((leitor) => (
                                    <tr key={leitor.id}>
                                        <td className="p-5 text-center">{leitor.nome}</td>
                                        <td className="p-5 text-center">{leitor.email || "-"}</td>
                                        <td className="p-5 text-center">{leitor.cpf ? formatCpf(leitor.cpf) : "-"}</td>
                                        <td className="p-5 text-center">{leitor.dataDeNascimento ?
                                            formatDate(leitor.dataDeNascimento) : "-"}</td>
                                        <td className="p-5 text-center">{leitor.estado}</td>
                                        <td className="p-5 text-center">
                                            <Link href={`/leitores/${leitor.id}/edit`}>
                                                <button className="btn-edit mr-6">
                                                    Editar
                                                </button>
                                            </Link>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleExcluir(leitor.id)}
                                                disabled={loadingId === leitor.id}
                                            >
                                                {loadingId === leitor.id ? (
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