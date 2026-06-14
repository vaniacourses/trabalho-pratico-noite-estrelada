import {EmprestimoRepository} from "@/repositories/emprestimoRepository.ts";
import {ReservaRepository} from "@/repositories/reservaRespository.ts";
import {LeitorRepository} from "@/repositories/leitorRepository.ts";
import {EstadoLeitor, EstadoReserva, Exemplar, Reserva} from "@prisma/client";
import {prisma} from "@/lib/prisma.ts";
import {reservaObserver, Subject} from "@/domain/Midia/observer/observerPattern.ts";

export class NotificarLeitoresServiceComObserver implements Subject {
    private reservaRespository: ReservaRepository;
    private emprestimoRepository: EmprestimoRepository;
    private leitorRespository: LeitorRepository;

    private observers: reservaObserver[] = [];

    private tratamentoDeReservas(reservas: any[]): void {
        for (const reserva of reservas) {
            if (reserva.leitor.estado === "REGULAR" as EstadoLeitor) {
                this.attach(new reservaObserver(reserva));
            }
        }

        this.observers.sort((a, b) =>
            a.getDataCriacao() - b.getDataCriacao()
        );

    }

    attach(observer: reservaObserver) {
        this.observers.push(observer);
    }

    detach(observer: reservaObserver) {
        this.observers.splice(this.observers.indexOf(observer), 1);
    }

    async notify() {
        // a reserva vai mudar seu estado e sera criado um emprestimo para ela. o leitor sera notificado
        await prisma.$transaction(async (tx) => {
            const primeiraReserva = this.observers[0]

            await tx.reserva.update({
                where: {id: primeiraReserva.getId()},
                data: {estado: "BLOQUEANTE" as EstadoReserva},
            });


        });

        // as demais reservas serão apenas para notificar os leitores de sua posição na "lista de espera"

        this.observers.slice(1, this.observers.length - 1)
            .forEach((reserva, index) => {
                reserva.update(reserva.getIdLeitor(), index);
            });

    }

    async notificarLeitores(exemplarDisponivel: Exemplar): Promise<any> {

        const reservas = await this.reservaRespository
            .obterReservasPorMidiaId(exemplarDisponivel.idMidia);

        this.tratamentoDeReservas(reservas);

        if (!this.observers) {
            console.log("Não há reservas para este exemplar")
            return {status: `Não há reservas para o exemplar ${exemplarDisponivel.id}`};

        }

        await this.notify()

    }


}
