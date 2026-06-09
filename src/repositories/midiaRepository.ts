import {prisma} from "@/src/lib/prisma.ts";
import {Midia, Prisma} from "@prisma/client";
import {IMidiaDTO} from "@/src/types";

export class MidiaRespository {

    async obterMidias(): Promise<Midia[]> {
        return prisma.midia.findMany({
            include: {
                exemplares: true,
                reservas: true,
            }
        });
    }

    async obterMidiaPorId(id: string): Promise<Midia | null> {
        return prisma.midia.findUnique({
            where: {id},
            include: {
                exemplares: true,
                reservas: true,
            }

        })
    }

    async criarMidia(midia: any): Promise<Midia> {
        return prisma.midia.create({data: midia});
    }

    async atualizarMidia(id: string, data: Partial<IMidiaDTO>): Promise<Midia> {
        return prisma.midia.update(
            {
                where: {id},
                data:{
                    titulo: data.titulo,
                    dataCriacao: data.dataCriacao,
                    dados: data.dados as unknown as Prisma.InputJsonValue,
                }
            }
        )
    }

    async deletarMidia(id: string) {
        return prisma.midia.delete({
            where: {id},
        });
    }


}