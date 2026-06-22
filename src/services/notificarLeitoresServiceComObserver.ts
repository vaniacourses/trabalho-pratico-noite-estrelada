import {ReservaRepository} from "@/repositories/reservaRespository.ts";
import {EstadoLeitor, EstadoReserva, Exemplar} from "@prisma/client";
import {prisma} from "@/lib/prisma.ts";
import {Observer, ReservaObserver, Subject} from "@/domain/Midia/observer/observerPattern.ts";

/**
 * Subject concreto do padrão Observer.
 *
 * Mantém a lista de reservas (observers) interessadas em uma mídia e, ao ser
 * acionado por um exemplar disponível, promove a primeira reserva e notifica
 * as demais de sua posição na fila.
 */
export class NotificarLeitoresServiceComObserver implements Subject {
    private observers: ReservaObserver[] = [];

    constructor(private reservaRepository: ReservaRepository = new ReservaRepository()) {
    }

    attach(observer: Observer): void {
        this.observers.push(observer as ReservaObserver);
    }

    detach(observer: Observer): void {
        const index = this.observers.indexOf(observer as ReservaObserver);
        if (index !== -1) {
            this.observers.splice(index, 1);
        }
    }

    private registrarReservas(reservas: any[]): void {
        for (const reserva of reservas) {
            if (reserva.leitor.estado === ("REGULAR" as EstadoLeitor)) {
                this.attach(new ReservaObserver(reserva));
            }
        }

        // Ordena por antiguidade: quem reservou primeiro fica no início da fila.
        this.observers.sort((a, b) => a.getDataCriacao() - b.getDataCriacao());
    }

    async notify(): Promise<void> {
        if (this.observers.length === 0) return;

        // A primeira reserva da fila vira bloqueante (será convertida em empréstimo).
        const primeira = this.observers[0];
        await prisma.$transaction(async (tx) => {
            await tx.reserva.update({
                where: {id: primeira.getId()},
                data: {estado: "BLOQUEANTE" as EstadoReserva},
            });
        });

        // As demais são apenas notificadas de sua posição na lista de espera.
        this.observers.slice(1).forEach((reserva, index) => {
            reserva.update(index + 1);
        });
    }

    async notificarLeitores(exemplarDisponivel: Exemplar): Promise<{status: string}> {
        const reservas = await this.reservaRepository.obterReservasPorMidiaId(
            exemplarDisponivel.idMidia
        );

        this.registrarReservas(reservas);

        if (this.observers.length === 0) {
            console.log("Não há reservas para esta mídia");
            return {status: `Não há reservas para o exemplar ${exemplarDisponivel.id}`};
        }

        await this.notify();
        return {status: `Leitores notificados para o exemplar ${exemplarDisponivel.id}`};
    }
}
