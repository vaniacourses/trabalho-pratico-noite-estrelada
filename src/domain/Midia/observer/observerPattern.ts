import {Reserva} from "@prisma/client";

export interface Observer {
    update(): void;

    update(val1: any, val2: any): void;
}

export class reservaObserver implements Observer {
    constructor(private reserva: Reserva) {
    }

    update(idLeitor?: string, index?: number) {
        console.log(`O leitor ${idLeitor} está na posição ${index} da lista de espera para este exemplar.`);
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

export interface Subject {
    attach(observer: Observer): void;

    detach(observer: Observer): void;

    notify(observer: Observer): void;
}

