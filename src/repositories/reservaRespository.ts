import type {Reserva} from "@prisma/client";
import {prisma} from "@/lib/prisma.ts";

export class ReservaRepository {

    async obterReservas(): Promise<Reserva[]> {
        return prisma.reserva.findMany();
    }

    async obterReservaPorId(id: string): Promise<Reserva | null> {
        return prisma.reserva.findUnique({
            where: {id},
            include: {
                leitor: true,
                midia: true
            }
        });
    }

    async obterReservasPorMidiaId(id: string) {
        return prisma.reserva.findMany({
            where: {idMidia: id},
            include: {
                leitor: true,
            }
        })
    }


}