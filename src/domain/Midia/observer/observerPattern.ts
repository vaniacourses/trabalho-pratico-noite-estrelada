import {EstadoReserva, Reserva} from "@prisma/client";

export interface Observer {
    update(): void;
}

export class reservaObserver implements Observer {
    constructor(private reserva: Reserva) {
    }

    update() {
    }

    getId(){
        return this.reserva.id;
    }

    getDataCriacao() {
        return this.reserva.dataCriacao.getTime();
    }

    setEstado(estado: EstadoReserva) {
        this.reserva.estado = estado;
    }
}

export interface Subject {
    attach(observer: Observer): void;

    detach(observer: Observer): void;

    notify(observer: Observer): void;
}

