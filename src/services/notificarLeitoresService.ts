import {EmprestimoRepository} from "@/repositories/emprestimoRepository.ts";
import {ReservaRepository} from "@/repositories/reservaRespository.ts";
import {LeitorRepository} from "@/repositories/leitorRepository.ts";
import {EstadoLeitor, EstadoReserva, Exemplar, Reserva} from "@prisma/client";
import {prisma} from "@/lib/prisma.ts";

export class NotificarLeitoresService {
    private reservaRespository: ReservaRepository;
    private emprestimoRepository: EmprestimoRepository;
    private leitorRespository: LeitorRepository


    private enviarNotificacao(idLeitor: string, index: number): void {
        console.log(`O leitor ${idLeitor} está na posição ${index} da lista de espera para este exemplar.`);
    }

    private async tratamentoDasReservas(exemplarDisponivel: Exemplar): Promise<Reserva[] | null> {

        const reservas = await
            this.reservaRespository.obterReservasPorMidiaId(exemplarDisponivel.idMidia);

        const reservasFiltradas = reservas.filter(reserva =>
            reserva.leitor.estado === "REGULAR" as EstadoLeitor);

        reservasFiltradas.sort((a, b) =>
            a.dataCriacao.getTime() - b.dataCriacao.getTime()
        );

        return reservas;
    }

    async notificarLeitores(exemplarDisponivel: Exemplar): Promise<any> {

        const reservasTratadas = await this.tratamentoDasReservas(exemplarDisponivel);

        if (!reservasTratadas) {
            console.log("Não há reservas para este exemplar")
            return {status: `Não há reservas para o exemplar ${exemplarDisponivel.id}`};

        }

        // a reserva vai mudar seu estado e sera criado um emprestimo para ela. o leitor sera notificado
        await prisma.$transaction(async (tx) => {
            const primeiraReserva = reservasTratadas[0];

            await tx.reserva.update({
                where: {id: primeiraReserva.id},
                data: {estado: "BLOQUEANTE" as EstadoReserva},
            });


        });

        // as demais reservas serão apenas para notificar os leitores de sua posição na "lista de espera"

        reservasTratadas.slice(1, reservasTratadas.length - 1)
            .forEach((reserva, index) => {
                this.enviarNotificacao(reserva.idLeitor, index);
            });

    }

}