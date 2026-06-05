'use client';

import {Leitor} from "@prisma/client";
import {formatDate} from "@/utils/helpers.ts";
import Link from "next/link";
import { useState, useEffect } from "react";

interface AlertState {
    show: boolean;
    message: string;
    tipo: 'sucesso' | 'erro';
}

export default function LeitoresPage() {
    const [leitores, setLeitores] = useState<Leitor[]>([]);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [alert, setAlert] = useState<AlertState>({ show: false, message: '', tipo: 'sucesso' });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchLeitores();
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
        } finally {
            setLoadingId(null);
            // Auto-hide alert after 5 seconds
            setTimeout(() => {
                setAlert(prev => ({ ...prev, show: false }));
            }, 5000);
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
            {/* Alert Messages */}
            {alert.show && (
                <div className={`alert alert-${alert.tipo === 'sucesso' ? 'success' : 'danger'} mx-6 mb-4`} role="alert">
                    <div className="flex items-center">
                        {alert.tipo === 'sucesso' ? (
                            <span className="mr-2">✓</span>
                        ) : (
                            <span className="mr-2">✕</span>
                        )}
                        <span>{alert.message}</span>
                        <button
                            type="button"
                            className="btn-close ml-auto"
                            onClick={() => setAlert(prev => ({ ...prev, show: false }))}
                            aria-label="Close"
                        ></button>
                    </div>
                </div>
            )}

            <div className={"flex justify-between items-center mb-6"}>
                <div className={"flex justify-around items-center mb-6"}>
                    <h1 className="text-3xl font-bold">
                        Lista de Leitores
                    </h1>
                    <button className={"btn btn-primary"}>Adicionar Leitor</button>
                </div>
                <div className="bg-white rounded shadow">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b">
                            <th className="text-left p-4">Nome</th>
                            <th className="text-left p-4">Email</th>
                            <th className="text-left p-4">CPF</th>
                            <th className="text-left p-4">Data de Nascimento</th>
                            <th className="text-left p-4">Estado</th>
                            <th className="text-left p-4">Ações</th>
                        </tr>
                        </thead>
                        <tbody>
                        {leitores.map((leitor) => (
                            <tr key={leitor.id}>
                                <td className="p-4">{leitor.nome}</td>
                                <td className="p-4">{leitor.email || "-"}</td>
                                <td className="p-4">{leitor.cpf || "-"}</td>
                                <td className="p-4">{formatDate(leitor.dataDeNascimento) || "-"}</td>
                                <td className="p-4">{leitor.estado}</td>
                                <td className="p-4">
                                    <Link href={`/leitores/${leitor.id}/editar`}>
                                        <button className="btn btn-sm btn-secondary mr-2">
                                            Editar
                                        </button>
                                    </Link>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleExcluir(leitor.id)}
                                        disabled={loadingId === leitor.id}
                                    >
                                        {loadingId === leitor.id ? (
                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm mr-2"
                                                    role="status"
                                                    aria-hidden="true"
                                                ></span>
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

                    {leitores.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            Nenhum leitor encontrado.
                        </div>
                    )}

                </div>
            </div>
        </main>
    );
}