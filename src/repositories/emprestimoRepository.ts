import {prisma} from "@/lib/prisma";
import type {Emprestimo} from "@prisma/client";

/**
 * EmprestimoRepository
 *
 * Camada de Persistência - Responsável pela comunicação com o banco de dados.
 * Segue o padrão GRASP: Information Expert (sabe como ler/escrever dados de empréstimo).
 *
 * Métodos:
 * - verificarExemplarDisponivel(): Verifica se um exemplar está disponível
 * - verificarLeitorVálido(): Verifica se o leitor pode fazer empréstimos
 * - criarEmprestimo(): Cria um novo empréstimo com transação atômica
 */
export class EmprestimoRepository {
    /**
     * Verifica se um exemplar está disponível para empréstimo
     */
    async verificarExemplarDisponivel(idExemplar: string): Promise<boolean> {
        const exemplar = await prisma.exemplar.findUnique({
            where: {id: idExemplar},
        });

        if (!exemplar) {
            return false;
        }

        return exemplar.estado === "DISPONIVEL";
    }

    /**
     * Verifica se o leitor está em estado válido para fazer empréstimos
     */
    async verificarLeitorValido(idLeitor: string): Promise<boolean> {
        const leitor = await prisma.leitor.findUnique({
            where: {id: idLeitor},
        });

        if (!leitor) {
            return false;
        }

        // Leitor em estado REGULAR pode fazer empréstimos
        return leitor.estado === "REGULAR" || leitor.estado === "INCOMPLETO";
    }

    /**
     * Conta empréstimos ativos (não finalizados) de um leitor
     */
    async contarEmprestimosAtivos(idLeitor: string): Promise<number> {
        return prisma.emprestimo.count({
            where: {
                idLeitor,
                estado: {in: ["CORRENTE", "ATRASADO"]},
            },
        });
    }

    /**
     * Cria um novo empréstimo com transação atômica
     * Transação garante que:
     * 1. O empréstimo é criado
     * 2. O estado do exemplar é atualizado para EMPRESTADO
     * Tudo isso acontece atomicamente - ou ambos ocorrem ou nenhum
     */
    async criarEmprestimo(
        idLeitor: string,
        idExemplar: string,
        dataExpiracao: Date
    ): Promise<Emprestimo> {
        return prisma.$transaction(async (tx) => {
            // 1. Criar o empréstimo
            const emprestimo = await tx.emprestimo.create({
                data: {
                    idLeitor,
                    idExemplar,
                    dataExpiracao,
                    estado: "CORRENTE",
                },
            });

            // 2. Atualizar o estado do exemplar para EMPRESTADO
            await tx.exemplar.update({
                where: {id: idExemplar},
                data: {estado: "EMPRESTADO"},
            });

            return emprestimo;
        });
    }

    /**
     * Finaliza um empréstimo e libera o exemplar
     */
    async finalizarEmprestimo(
        idEmprestimo: string
    ): Promise<Emprestimo> {
        return prisma.$transaction(async (tx) => {
            // 1. Encontrar o empréstimo
            const emprestimo = await tx.emprestimo.findUnique({
                where: {id: idEmprestimo},
            });

            if (!emprestimo) {
                throw new Error("Empréstimo não encontrado");
            }

            // 2. Atualizar o empréstimo para FINALIZADO
            const emprestimoFinalizado = await tx.emprestimo.update({
                where: {id: idEmprestimo},
                data: {
                    estado: "FINALIZADO",
                    dataFinalizacao: new Date(),
                },
            });

            // 3. Atualizar o exemplar para DISPONÍVEL
            await tx.exemplar.update({
                where: {id: emprestimo.idExemplar},
                data: {estado: "DISPONIVEL"},
            });

            return emprestimoFinalizado;
        });
    }

    /**
     * Cria uma solicitação de empréstimo pendente (sem alterar o exemplar ainda)
     */
    async solicitarEmprestimo(
        idLeitor: string,
        idExemplar: string,
        dataExpiracao: Date
    ): Promise<Emprestimo> {
        return prisma.emprestimo.create({
            data: {
                idLeitor,
                idExemplar,
                dataExpiracao,
                estado: "PENDENTE",
            },
        });
    }

    /**
     * Aprova uma solicitação: muda para CORRENTE e marca exemplar como EMPRESTADO
     */
    async aprovarEmprestimo(idEmprestimo: string): Promise<Emprestimo> {
        return prisma.$transaction(async (tx) => {
            const emprestimo = await tx.emprestimo.findUnique({
                where: { id: idEmprestimo },
                include: { exemplar: true },
            });

            if (!emprestimo) throw new Error("Empréstimo não encontrado");
            if (emprestimo.estado !== "PENDENTE") throw new Error("Apenas solicitações pendentes podem ser aprovadas");

            if (emprestimo.exemplar.estado !== "DISPONIVEL") {
                throw new Error(
                    "Não é possível aprovar: o exemplar solicitado não está mais disponível. Rejeite esta solicitação e oriente o leitor a solicitar outro exemplar."
                );
            }

            const aprovado = await tx.emprestimo.update({
                where: { id: idEmprestimo },
                data: { estado: "CORRENTE" },
            });

            await tx.exemplar.update({
                where: { id: emprestimo.idExemplar },
                data: { estado: "EMPRESTADO" },
            });

            return aprovado;
        });
    }

    /**
     * Rejeita uma solicitação pendente
     */
    async rejeitarEmprestimo(idEmprestimo: string): Promise<Emprestimo> {
        const emprestimo = await prisma.emprestimo.findUnique({
            where: { id: idEmprestimo },
        });

        if (!emprestimo) throw new Error("Empréstimo não encontrado");
        if (emprestimo.estado !== "PENDENTE") throw new Error("Apenas solicitações pendentes podem ser rejeitadas");

        return prisma.emprestimo.update({
            where: { id: idEmprestimo },
            data: { estado: "REJEITADO", dataFinalizacao: new Date() },
        });
    }

    /**
     * Lista todas as solicitações com estado PENDENTE
     */
    async listarPendentes() {
        return prisma.emprestimo.findMany({
            where: { estado: "PENDENTE" },
            include: {
                leitor: { select: { id: true, nome: true, email: true } },
                exemplar: {
                    include: {
                        midia: { select: { id: true, titulo: true, tipo: true } },
                    },
                },
            },
            orderBy: { dataInicio: "asc" },
        });
    }

    /**
     * Lista os empréstimos mais recentes com dados do leitor
     */
    async listarRecentes(limite: number = 10) {
        return prisma.emprestimo.findMany({
            orderBy: { dataInicio: "desc" },
            take: limite,
            include: {
                leitor: { select: { nome: true, email: true } },
                exemplar: {
                    select: {
                        codigo: true,
                        midia: { select: { titulo: true } },
                    },
                },
            },
        });
    }

    /**
     * Obtém um empréstimo por ID com seus relacionamentos
     */
    async obterEmprestimoPorId(idEmprestimo: string) {
        return prisma.emprestimo.findUnique({
            where: {id: idEmprestimo},
            include: {
                leitor: true,
                exemplar: {
                    include: {
                        midia: true,
                    },
                },
            },
        });
    }
}
