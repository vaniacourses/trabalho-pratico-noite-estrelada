import {prisma} from "@/lib/prisma"
import type {Leitor, EstadoLeitor} from "@prisma/client";

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
        nome: string,
        senha: string,
        estado?: EstadoLeitor | string,
        email?: string,
        cpf?: string,
        dataDeNascimento?: Date
    ): Promise<Leitor> {
        const data: any = {
            nome,
            senha,
        };

        if (estado) data.estado = estado as EstadoLeitor;
        if (email) data.email = email;
        if (cpf) data.cpf = cpf;
        if (dataDeNascimento) data.dataDeNascimento = dataDeNascimento;

        return await prisma.leitor.create({
            data,
        });
    }

    async atualizarLeitor(id: string, data: Partial<Leitor>): Promise<Leitor> {
        return await prisma.leitor.update({
            where: { id },
            data,
        });
    }

    async deletarLeitor(id: string) {
        return await prisma.leitor.delete({
            where: { id },
        });
    }
}