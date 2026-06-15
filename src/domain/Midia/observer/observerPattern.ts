import {Reserva} from "@prisma/client";

/**
 * Observer (GoF - Comportamental)
 *
 * Quando um exemplar fica disponível, os leitores que reservaram a mídia (os
 * observers) são notificados de sua posição na lista de espera. O serviço de
 * notificação atua como Subject, mantendo e percorrendo a lista de observers.
 */
export interface Observer {
    /** Notifica o observer de sua posição (index) na lista de espera. */
    update(posicao: number): void;
}

export interface Subject {
    attach(observer: Observer): void;

    detach(observer: Observer): void;

    notify(): Promise<void> | void;
}

export class ReservaObserver implements Observer {
    constructor(private reserva: Reserva) {
    }

    update(posicao: number): void {
        console.log(
            `O leitor ${this.reserva.idLeitor} está na posição ${posicao} da lista de espera para esta mídia.`
        );
    }

    getId() {
        return this.reserva.id;
    }

    getDataCriacao() {
        return this.reserva.dataCriacao.getTime();
    }

    getIdLeitor() {
        return this.reserva.idLeitor;
    }
}
