import {prisma} from "@/lib/prisma"
import type {Leitor} from "@prisma/client";

export class LeitorRepository {
    async obterLeitorPorId(id: string): Promise<Leitor | null> {
        return prisma.leitor.findUnique({
            where: {id},
            include: {
                emprestimos: true,
                reservas: true
            }
        });
    }

    async obterLeitores(): Promise<Leitor[]> {
        return prisma.leitor.findMany({
            include: {
                emprestimos: true,
                reservas: true,
            },
        });
    }

    async criarLeitor(
        data: any
    ): Promise<Leitor> {

        data.email = data.email?.trim() || undefined
        data.cpf = data.cpf?.trim() || undefined
        data.dataDeNascimento = data.dataDeNascimento?.trim() || undefined

        return prisma.leitor.create({
            data,
        });
    }

    async atualizarLeitor(id: string, data: Partial<Leitor>): Promise<Leitor> {
        return prisma.leitor.update({
            where: {id},
            data,
        });
    }

    async deletarLeitor(id: string) {
        return prisma.leitor.delete({
            where: {id},
        });
    }
}