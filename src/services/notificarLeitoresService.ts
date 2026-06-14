import {EmprestimoRepository} from "@/repositories/emprestimoRepository.ts";
import {ReservaRepository} from "@/repositories/reservaRespository.ts";
import {LeitorRepository} from "@/repositories/leitorRepository.ts";
import {EstadoLeitor, EstadoReserva, Exemplar, Reserva} from "@prisma/client";
import {prisma} from "@/lib/prisma.ts";
import {reservaObserver, Subject} from "@/domain/Midia/observer/observerPattern.ts";

export class NotificarLeitoresService implements Subject {
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

    private attach(observer: reservaObserver) {
        this.observers.push(observer);
    }

    private detach(observer: reservaObserver) {
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
                reserva.update(reserva, index);
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


// export class NotificarLeitoresService {
//     private reservaRespository: ReservaRepository;
//     private emprestimoRepository: EmprestimoRepository;
//     private leitorRespository: LeitorRepository
//
//
//     private enviarNotificacao(idLeitor: string, index: number): void {
//         console.log(`O leitor ${idLeitor} está na posição ${index} da lista de espera para este exemplar.`);
//     }
//
//     private async tratamentoDasReservas(exemplarDisponivel: Exemplar): Promise<Reserva[] | null> {
//
//         const reservas = await
//             this.reservaRespository.obterReservasPorMidiaId(exemplarDisponivel.idMidia);
//
//         const reservasFiltradas = reservas.filter(reserva =>
//             reserva.leitor.estado === "REGULAR" as EstadoLeitor);
//
//         reservasFiltradas.sort((a, b) =>
//             a.dataCriacao.getTime() - b.dataCriacao.getTime()
//         );
//
//         return reservas;
//     }
//
//     async notificarLeitores(exemplarDisponivel: Exemplar): Promise<any> {
//
//         const reservasTratadas = await this.tratamentoDasReservas(exemplarDisponivel);
//
//         if (!reservasTratadas) {
//             console.log("Não há reservas para este exemplar")
//             return {status: `Não há reservas para o exemplar ${exemplarDisponivel.id}`};
//
//         }
//
//         // a reserva vai mudar seu estado e sera criado um emprestimo para ela. o leitor sera notificado
//         await prisma.$transaction(async (tx) => {
//             const primeiraReserva = reservasTratadas[0];
//
//             await tx.reserva.update({
//                 where: {id: primeiraReserva.id},
//                 data: {estado: "BLOQUEANTE" as EstadoReserva},
//             });
//
//
//         });
//
//         // as demais reservas serão apenas para notificar os leitores de sua posição na "lista de espera"
//
//         reservasTratadas.slice(1, reservasTratadas.length - 1)
//             .forEach((reserva, index) => {
//                 this.enviarNotificacao(reserva.idLeitor, index);
//             });
//
//     }
//
// }