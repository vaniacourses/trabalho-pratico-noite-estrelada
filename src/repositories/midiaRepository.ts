import {prisma} from "@/src/lib/prisma.ts";
import {Midia} from "@prisma/client";

export class MidiaRespository {

    async obterMidias(): Promise<Midia[]> {
        return prisma.midia.findMany(
            {
                include: {
                    livro: true,
                    cd: true,
                    dvd: true
                }
            }
        );
    }

    async obterMidiaPorId(id: string): Promise<Midia | null> {
        return prisma.midia.findUnique({
            where: {id},
            include: {
                livro: true,
                cd: true,
                dvd: true
            }

        })
    }

    async criarMidia(midia: any): Promise<Midia> {
        return prisma.midia.create({data: midia});
    }

    async atualizarMidia(id: string, data: Partial<Midia>): Promise<Midia> {
        return prisma.midia.update(
            {
                where: {id},
                data
            }
        )
    }

    async deletarMidia(id: string) {
        return prisma.midia.delete({
            where: {id},
        });
    }


}