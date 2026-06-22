"use client";

import {EstadoReserva, TipoDeMidia, Reserva, Leitor, Midia} from "@prisma/client";
import {formatDate} from "@/utils/helpers.ts";
import Link from "next/link";
import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
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

const estadoOptions: Array<{value: EstadoReserva | ""; label: string}> = [
    {value: "", label: "Todos os estados"},
    {value: "EM_ESPERA", label: "Em Espera"},
    {value: "BLOQUEANTE", label: "Bloqueante"},
    {value: "FINALIZADA", label: "Finalizada"},
];

const tipoOptions: Array<{value: TipoDeMidia | ""; label: string}> = [
    {value: "", label: "Todos os tipos"},
    {value: "PUBLICACAO", label: "Publicação"},
    {value: "CD", label: "CD"},
    {value: "DVD", label: "DVD"},
];

export default function ReservasPage() {
    const router = useRouter();
    const [reservas, setReservas] = useState<ReservaComRelacoes[]>([]);
    const [alert, setAlert] = useState<AlertState>({show: false, message: '', tipo: 'sucesso'});
    const [isLoading, setIsLoading] = useState(true);

    // Filtros
    const [estadoFiltro, setEstadoFiltro] = useState("");
    const [tipoFiltro, setTipoFiltro] = useState("");
    const [nomeMidiaFiltro, setNomeMidiaFiltro] = useState("");
    const [nomeLeitorFiltro, setNomeLeitorFiltro] = useState("");

    useEffect(() => {
        fetchReservas();
    }, [estadoFiltro, tipoFiltro, nomeMidiaFiltro, nomeLeitorFiltro]);

    const fetchReservas = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams();

            if (estadoFiltro) params.append("estado", estadoFiltro);
            if (tipoFiltro) params.append("tipoMidia", tipoFiltro);
            if (nomeMidiaFiltro) params.append("nomeMidia", nomeMidiaFiltro);
            if (nomeLeitorFiltro) params.append("nomeLeitor", nomeLeitorFiltro);

            const response = await fetch(`/api/reservas?${params.toString()}`);
            const data = await response.json();

            if (response.ok) {
                setReservas(data.dados || []);
            } else {
                setAlert({
                    show: true,
                    message: data.erro?.mensagem || 'Erro ao carregar reservas',
                    tipo: 'erro'
                });
            }
        } catch (erro: any) {
            setAlert({
                show: true,
                message: erro.message || 'Erro ao carregar reservas',
                tipo: 'erro'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLimparFiltros = () => {
        setEstadoFiltro("");
        setTipoFiltro("");
        setNomeMidiaFiltro("");
        setNomeLeitorFiltro("");
    };

    if (isLoading) {
        return (
            <AuthenticatedLayout title="Lista de Reservas" subtitle="Gerencie as reservas de mídias da biblioteca">
                <div className="flex justify-center items-center py-20">
                    <div className="flex items-center gap-3 text-brand-secondary">
                        <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        <span className="text-sm font-medium">Carregando reservas...</span>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout title="Lista de Reservas" subtitle="Gerencie as reservas de mídias da biblioteca">
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

            <Card className="shadow-premium mb-6">
                <CardHeader>
                    <CardTitle>Filtros</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-brand-secondary mb-2">
                                Estado da Reserva
                            </label>
                            <select
                                value={estadoFiltro}
                                onChange={(e) => setEstadoFiltro(e.target.value)}
                                className="w-full px-3 py-2 border border-brand-secondary/20 rounded-lg text-sm focus:outline-none focus:border-brand-primary"
                            >
                                {estadoOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-brand-secondary mb-2">
                                Tipo de Mídia
                            </label>
                            <select
                                value={tipoFiltro}
                                onChange={(e) => setTipoFiltro(e.target.value)}
                                className="w-full px-3 py-2 border border-brand-secondary/20 rounded-lg text-sm focus:outline-none focus:border-brand-primary"
                            >
                                {tipoOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-brand-secondary mb-2">
                                Nome da Mídia
                            </label>
                            <input
                                type="text"
                                placeholder="Buscar por título..."
                                value={nomeMidiaFiltro}
                                onChange={(e) => setNomeMidiaFiltro(e.target.value)}
                                className="w-full px-3 py-2 border border-brand-secondary/20 rounded-lg text-sm focus:outline-none focus:border-brand-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-brand-secondary mb-2">
                                Nome do Leitor
                            </label>
                            <input
                                type="text"
                                placeholder="Buscar por leitor..."
                                value={nomeLeitorFiltro}
                                onChange={(e) => setNomeLeitorFiltro(e.target.value)}
                                className="w-full px-3 py-2 border border-brand-secondary/20 rounded-lg text-sm focus:outline-none focus:border-brand-primary"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleLimparFiltros}
                        className="mt-4 text-sm text-brand-secondary hover:text-brand-text transition-colors"
                    >
                        Limpar Filtros
                    </button>
                </CardContent>
            </Card>

            <Card className="shadow-premium">
                <CardHeader>
                    <CardTitle>Reservas Cadastradas</CardTitle>
                </CardHeader>

                <CardContent>
                    {reservas.length === 0 ? (
                        <div className="py-12 text-center text-brand-secondary">
                            <p className="text-lg font-medium">Nenhuma reserva encontrada.</p>
                            <p className="text-sm mt-1">Tente ajustar os filtros ou faça uma nova reserva.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-brand-secondary/20">
                                        <th className="text-left py-3 px-4 text-brand-secondary font-semibold">Nome do Leitor</th>
                                        <th className="text-left py-3 px-4 text-brand-secondary font-semibold">Mídia</th>
                                        <th className="text-left py-3 px-4 text-brand-secondary font-semibold">Tipo</th>
                                        <th className="text-left py-3 px-4 text-brand-secondary font-semibold">Estado</th>
                                        <th className="text-left py-3 px-4 text-brand-secondary font-semibold">Data da Reserva</th>
                                        <th className="text-right py-3 px-4 text-brand-secondary font-semibold">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reservas.map((reserva) => (
                                        <tr key={reserva.id} className="border-b border-brand-secondary/10 hover:bg-brand-accent/5 transition">
                                            <td className="py-3 px-4 text-brand-text font-medium">{reserva.leitor.nome}</td>
                                            <td className="py-3 px-4 text-brand-text">{reserva.midia.titulo}</td>
                                            <td className="py-3 px-4 text-brand-text">
                                                {mediaTranslate[reserva.midia.tipo]}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    reserva.estado === 'EM_ESPERA'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : reserva.estado === 'BLOQUEANTE'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-green-100 text-green-800'
                                                }`}>
                                                    {reservaStateTranslate[reserva.estado]}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-brand-secondary">
                                                {formatDate(reserva.dataCriacao)}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Link href={`/reservas/${reserva.id}`}>
                                                    <button className="text-brand-primary hover:text-brand-secondary transition-colors text-sm font-semibold">
                                                        Ver Detalhes
                                                    </button>
                                                </Link>
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
