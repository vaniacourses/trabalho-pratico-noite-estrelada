import {EmprestimoRepository} from "@/repositories/emprestimoRepository.ts";
import {ReservaRepository} from "@/repositories/reservaRespository.ts";
import {LeitorRepository} from "@/repositories/leitorRepository.ts";
import {Exemplar, Reserva} from "@prisma/client";
import {prisma} from "@/lib/prisma.ts";

export class NotificarLeitoresService {
    private reservaRespository: ReservaRepository;
    private emprestimoRepository: EmprestimoRepository;
    private leitorRespository: LeitorRepository

    private tratamentoDasReservas(reservas: Reserva []): Reserva[] {

        reservas.sort((a, b) =>
            a.dataCriacao.getTime() - b.dataCriacao.getTime()
        );

        return reservas;
    }

    async notificarLeitores(exemplarDisponivel: Exemplar): Promise<any> {
        const reservas = await
            this.reservaRespository.obterReservasPorMidiaId(exemplarDisponivel.idMidia);

        if (!reservas) {
            console.log("Não há reservas para este exemplar")
            return {status: `Não há reservas para o exemplar ${exemplarDisponivel.id}`};
        }

        const reservasTratadas = this.tratamentoDasReservas(reservas);

        // a reserva vai mudar seu estado e sera criado um emprestimo para ela. o leitor sera notificado
        await prisma.$transaction(async (tx) => {

        });

        // as demais reservas serão apenas para notificar os leitores de sua posição na "lista de espera"
        for (const reserva of reservasTratadas.slice(1, reservas.length - 1)) {

        }

    }

}