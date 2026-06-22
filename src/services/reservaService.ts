import {ReservaRepository} from "@/repositories/reservaRespository.ts";
import type {EstadoReserva, TipoDeMidia, Reserva} from "@prisma/client";
import type {IErroAplicacao} from "@/types";

interface IFiltrosReserva {
    estado?: EstadoReserva;
    tipoMidia?: TipoDeMidia;
    nomeMidia?: string;
    nomeLeitor?: string;
}

export class ReservaService {
    private repository: ReservaRepository;

    constructor(repository?: ReservaRepository) {
        this.repository = repository || new ReservaRepository();
    }

    async obterTodasAsReservas(filtros?: IFiltrosReserva) {
        try {
            return await this.repository.obterReservasPaginadas(filtros);
        } catch (error: any) {
            throw this.criarErro(
                "ERRO_AO_LISTAR_RESERVAS",
                error.message || "Erro ao listar reservas",
                500
            );
        }
    }

    async obterReservaPorId(id: string) {
        try {
            const reserva = await this.repository.obterReservaPorId(id);
            if (!reserva) {
                throw this.criarErro(
                    "RESERVA_NAO_ENCONTRADA",
                    "Reserva não encontrada",
                    404
                );
            }
            return reserva;
        } catch (error: any) {
            if (error?.statusHttp) throw error;
            throw this.criarErro(
                "ERRO_AO_OBTER_RESERVA",
                error.message || "Erro ao obter reserva",
                500
            );
        }
    }

    async obterOpcoesUnicas() {
        try {
            return await this.repository.obterOpcoesUnicas();
        } catch (error: any) {
            throw this.criarErro(
                "ERRO_AO_OBTER_OPCOES",
                error.message || "Erro ao obter opções de filtro",
                500
            );
        }
    }

    private criarErro(
        codigo: string,
        mensagem: string,
        statusHttp: number
    ): IErroAplicacao {
        return {
            codigo,
            mensagem,
            statusHttp,
        };
    }
}
