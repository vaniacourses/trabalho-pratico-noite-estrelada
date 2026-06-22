"use client";

import {useParams, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {Reserva, Leitor, Midia} from "@prisma/client";
import {formatDate} from "@/utils/helpers.ts";
import {mediaTranslate, reservaStateTranslate} from "@/domain/translation.ts";
import {AuthenticatedLayout} from "@/components/layout/Layout";
import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/Card";
import {Alert} from "@/components/ui/Alert";

interface ReservaComRelacoes extends Reserva {
    leitor: Leitor;
    midia: Midia;
}

interface AlertState {
    show: boolean;
    message: string;
    tipo: 'sucesso' | 'erro';
}

export default function ReservaDetalhePage() {
    const params = useParams();
    const router = useRouter();
    const reservaId = params.id as string;

    const [reserva, setReserva] = useState<ReservaComRelacoes | null>(null);
    const [alert, setAlert] = useState<AlertState>({show: false, message: '', tipo: 'sucesso'});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchReservaDetalhes();
    }, [reservaId]);

    const fetchReservaDetalhes = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/reservas/${reservaId}`);
            const data = await response.json();

            if (response.ok) {
                setReserva(data.dados);
            } else {
                setAlert({
                    show: true,
                    message: data.erro?.mensagem || 'Erro ao carregar reserva',
                    tipo: 'erro'
                });
            }
        } catch (erro: any) {
            setAlert({
                show: true,
                message: erro.message || 'Erro ao carregar reserva',
                tipo: 'erro'
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <AuthenticatedLayout title="Detalhes da Reserva" subtitle="Informações detalhadas da reserva">
                <div className="flex justify-center items-center py-20">
                    <div className="flex items-center gap-3 text-brand-secondary">
                        <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        <span className="text-sm font-medium">Carregando detalhes...</span>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    if (!reserva) {
        return (
            <AuthenticatedLayout title="Detalhes da Reserva" subtitle="Informações detalhadas da reserva">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1 mb-4 text-sm text-brand-secondary hover:text-brand-text transition-colors"
                >
                    ← Voltar
                </button>
                <Card className="shadow-premium">
                    <CardContent>
                        <div className="py-12 text-center text-brand-secondary">
                            <p className="text-lg font-medium">Reserva não encontrada.</p>
                        </div>
                    </CardContent>
                </Card>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout title="Detalhes da Reserva" subtitle="Informações detalhadas da reserva">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Informações Principais */}
                <div className="lg:col-span-2">
                    <Card className="shadow-premium">
                        <CardHeader>
                            <CardTitle>Informações da Reserva</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* ID da Reserva */}
                                <div>
                                    <label className="text-sm font-medium text-brand-secondary">ID da Reserva</label>
                                    <p className="text-brand-text font-mono text-sm mt-1">{reserva.id}</p>
                                </div>

                                {/* Estado */}
                                <div>
                                    <label className="text-sm font-medium text-brand-secondary">Estado</label>
                                    <div className="mt-2">
                                        <span className={`px-4 py-2 rounded-full text-sm font-semibold inline-block ${
                                            reserva.estado === 'EM_ESPERA'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : reserva.estado === 'BLOQUEANTE'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-green-100 text-green-800'
                                        }`}>
                                            {reservaStateTranslate[reserva.estado]}
                                        </span>
                                    </div>
                                </div>

                                {/* Datas */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-brand-secondary">Data de Criação</label>
                                        <p className="text-brand-text mt-1">{formatDate(reserva.dataCriacao)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-brand-secondary">Última Atualização</label>
                                        <p className="text-brand-text mt-1">{formatDate(reserva.dataAtualizacao)}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar com Leitor */}
                <div className="space-y-6">
                    {/* Informações do Leitor */}
                    <Card className="shadow-premium">
                        <CardHeader>
                            <CardTitle>Leitor</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-brand-secondary">Nome</label>
                                    <p className="text-brand-text font-semibold mt-1">{reserva.leitor.nome}</p>
                                </div>

                                {reserva.leitor.email && (
                                    <div>
                                        <label className="text-sm font-medium text-brand-secondary">Email</label>
                                        <p className="text-brand-text mt-1 break-all">{reserva.leitor.email}</p>
                                    </div>
                                )}

                                {reserva.leitor.cpf && (
                                    <div>
                                        <label className="text-sm font-medium text-brand-secondary">CPF</label>
                                        <p className="text-brand-text mt-1">{reserva.leitor.cpf}</p>
                                    </div>
                                )}

                                <button
                                    onClick={() => router.push(`/leitores/${reserva.leitor.id}`)}
                                    className="w-full mt-4 px-3 py-2 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-lg text-sm font-semibold transition-colors"
                                >
                                    Ver Perfil do Leitor
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Informações da Mídia */}
            <Card className="shadow-premium mt-6">
                <CardHeader>
                    <CardTitle>Mídia Reservada</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <label className="text-sm font-medium text-brand-secondary">Título</label>
                            <p className="text-brand-text font-semibold mt-1">{reserva.midia.titulo}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-brand-secondary">Tipo de Mídia</label>
                            <p className="text-brand-text mt-1">{mediaTranslate[reserva.midia.tipo]}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-brand-secondary">ID da Mídia</label>
                            <p className="text-brand-text font-mono text-sm mt-1">{reserva.midia.id}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-brand-secondary">Data de Criação</label>
                            <p className="text-brand-text mt-1">{formatDate(reserva.midia.dataCriacao)}</p>
                        </div>

                        <div className="md:col-span-2 lg:col-span-4">
                            <button
                                onClick={() => router.push(`/midias/${reserva.midia.id}`)}
                                className="px-4 py-2 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-lg text-sm font-semibold transition-colors"
                            >
                                Ver Detalhes da Mídia
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
