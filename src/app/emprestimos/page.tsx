"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDate } from "@/utils/helpers.ts";

interface Leitor {
    id: string;
    nome: string;
    email: string | null;
    estado: string;
}

interface Midia {
    id: string;
    tipo: string;
    titulo: string;
}

interface Exemplar {
    id: string;
    idMidia: string;
    estado: string;
    midia: Midia;
}

interface Emprestimo {
    id: string;
    idLeitor: string;
    idExemplar: string;
    dataInicio: string;
    dataExpiracao: string;
    dataFinalizacao: string | null;
    estado: string;
    leitor: Leitor;
    exemplar: Exemplar;
}

interface AlertState {
    show: boolean;
    message: string;
    tipo: 'sucesso' | 'erro';
}

export default function EmprestimosPage() {
    const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [alert, setAlert] = useState<AlertState>({ show: false, message: '', tipo: 'sucesso' });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchEmprestimos();
    }, []);

    const fetchEmprestimos = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/emprestimos');
            const data = await response.json();

            if (response.ok) {
                setEmprestimos(data.dados || []);
            } else {
                setAlert({
                    show: true,
                    message: data.erro?.mensagem || 'Erro ao carregar empréstimos',
                    tipo: 'erro'
                });
            }
        } catch (erro: any) {
            setAlert({
                show: true,
                message: erro.message || 'Erro ao carregar empréstimos',
                tipo: 'erro'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFinalizarEmprestimo = async (emprestimoId: string) => {
        setLoadingId(emprestimoId);

        try {
            const response = await fetch(`/api/emprestimos/${emprestimoId}`, {
                method: 'PUT',
            });

            const data = await response.json();

            if (response.ok) {
                setEmprestimos(prev =>
                    prev.map(e =>
                        e.id === emprestimoId
                            ? { ...e, estado: 'FINALIZADO', dataFinalizacao: new Date().toISOString() }
                            : e
                    )
                );
                setAlert({
                    show: true,
                    message: data.mensagem || 'Empréstimo finalizado com sucesso',
                    tipo: 'sucesso'
                });
            } else {
                setAlert({
                    show: true,
                    message: data.erro?.mensagem || 'Erro ao finalizar empréstimo',
                    tipo: 'erro'
                });
            }
        } catch (erro: any) {
            setAlert({
                show: true,
                message: erro.message || 'Erro ao finalizar empréstimo',
                tipo: 'erro'
            });
        } finally {
            setLoadingId(null);
        }
    };

    const getEstadoClass = (estado: string) => {
        switch (estado) {
            case 'CORRENTE':
                return 'bg-blue-100 text-blue-800 px-3 py-1 rounded';
            case 'ATRASADO':
                return 'bg-red-100 text-red-800 px-3 py-1 rounded';
            case 'FINALIZADO':
                return 'bg-green-100 text-green-800 px-3 py-1 rounded';
            default:
                return 'bg-gray-100 text-gray-800 px-3 py-1 rounded';
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
                        onClick={() => setAlert(prev => ({ ...prev, show: false }))}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>
            )}
            <div>
                <h1 className="text-3xl text-center font-bold mt-6">
                    Lista de Empréstimos
                </h1>
                <div className={"items-center mb-6"}>
                    <Link href={"/balcao"}>
                        <div className={"flex justify-end items-center mb-4 mr-6"}>
                            <button className={"btn-edit"}>Novo Empréstimo</button>
                        </div>
                    </Link>
                    {emprestimos.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            <h1>Nenhum empréstimo encontrado.</h1>
                        </div>
                    )}
                    {emprestimos.length > 0 && (
                        <div className="bg-white flex justify-center rounded shadow p-6">
                            <table className="border-collapse w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-center p-4">Leitor</th>
                                        <th className="text-center p-4">Mídia</th>
                                        <th className="text-center p-4">Data Início</th>
                                        <th className="text-center p-4">Data Expiração</th>
                                        <th className="text-center p-4">Data Finalização</th>
                                        <th className="text-center p-4">Estado</th>
                                        <th className="text-center p-4">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {emprestimos.map((emprestimo) => (
                                        <tr key={emprestimo.id} className="border-b hover:bg-gray-50">
                                            <td className="p-5 text-center">{emprestimo.leitor.nome}</td>
                                            <td className="p-5 text-center">{emprestimo.exemplar.midia.titulo}</td>
                                            <td className="p-5 text-center">
                                                {formatDate(new Date(emprestimo.dataInicio))}
                                            </td>
                                            <td className="p-5 text-center">
                                                {formatDate(new Date(emprestimo.dataExpiracao))}
                                            </td>
                                            <td className="p-5 text-center">
                                                {emprestimo.dataFinalizacao
                                                    ? formatDate(new Date(emprestimo.dataFinalizacao))
                                                    : "-"}
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className={getEstadoClass(emprestimo.estado)}>
                                                    {emprestimo.estado}
                                                </span>
                                            </td>
                                            <td className="p-5 text-center">
                                                {emprestimo.estado !== 'FINALIZADO' && (
                                                    <button
                                                        className="btn-edit"
                                                        onClick={() => handleFinalizarEmprestimo(emprestimo.id)}
                                                        disabled={loadingId === emprestimo.id}
                                                    >
                                                        {loadingId === emprestimo.id ? (
                                                            <>Finalizando...</>
                                                        ) : (
                                                            'Finalizar'
                                                        )}
                                                    </button>
                                                )}
                                                {emprestimo.estado === 'FINALIZADO' && (
                                                    <span className="text-gray-400">-</span>
                                                )}
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
