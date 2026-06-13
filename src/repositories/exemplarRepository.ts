import {EstadoExemplar, Exemplar} from "@prisma/client";
import {prisma} from "@/lib/prisma.ts";
import {IExemplarDTO} from "@/types";

export class ExemplarRepository {
    async criarExemplar(data: IExemplarDTO): Promise<Exemplar> {
        return prisma.exemplar.create({
            data: {
                idMidia: data.idMidia,
                codigo: data.codigo as EstadoExemplar,
                estado: "DISPONIVEL",
            },
        });
    }

    async obterExemplaresPorMidia(idMidia: string): Promise<Exemplar[]> {
        return prisma.exemplar.findMany({
            where: { idMidia },
        });
    }

    async obterExemplarPorCodigo(codigo: string): Promise<Exemplar | null> {
        return prisma.exemplar.findUnique({
            where: { codigo },
        });
    }

    async deletarExemplar(id: string): Promise<Exemplar> {
        return prisma.exemplar.delete({
            where: { id },
        });
    }
}

