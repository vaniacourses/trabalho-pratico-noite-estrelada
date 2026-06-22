import type {Reserva, EstadoReserva, TipoDeMidia} from "@prisma/client";
import {prisma} from "@/lib/prisma.ts";

interface IFiltrosReserva {
    estado?: EstadoReserva;
    tipoMidia?: TipoDeMidia;
    nomeMidia?: string;
    nomeLeitor?: string;
}

export class ReservaRepository {

    async obterReservas(): Promise<Reserva[]> {
        return prisma.reserva.findMany();
    }

    async obterReservasPaginadas(filtros?: IFiltrosReserva) {
        const where: any = {};

        if (filtros?.estado) {
            where.estado = filtros.estado;
        }

        if (filtros?.tipoMidia) {
            where.midia = {
                tipo: filtros.tipoMidia
            };
        }

        if (filtros?.nomeMidia) {
            where.midia = {
                ...where.midia,
                titulo: {
                    contains: filtros.nomeMidia,
                    mode: "insensitive"
                }
            };
        }

        if (filtros?.nomeLeitor) {
            where.leitor = {
                nome: {
                    contains: filtros.nomeLeitor,
                    mode: "insensitive"
                }
            };
        }

        return prisma.reserva.findMany({
            where,
            include: {
                leitor: true,
                midia: true
            },
            orderBy: {
                dataCriacao: "desc"
            }
        });
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

    async obterOpcoesUnicas() {
        const [estados, tipos] = await Promise.all([
            prisma.reserva.findMany({
                distinct: ["estado"],
                select: {estado: true}
            }),
            prisma.midia.findMany({
                distinct: ["tipo"],
                select: {tipo: true}
            })
        ]);

        return {
            estados: [...new Set(estados.map(e => e.estado))],
            tipos: [...new Set(tipos.map(t => t.tipo))]
        };
    }
}