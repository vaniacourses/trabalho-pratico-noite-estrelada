import { prisma } from "@/lib/prisma";
import type { Emprestimo, Exemplar, Leitor } from "@prisma/client";

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
      where: { id: idExemplar },
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
      where: { id: idLeitor },
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
        estado: { in: ["CORRENTE", "ATRASADO"] },
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
        where: { id: idExemplar },
        data: { estado: "EMPRESTADO" },
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
        where: { id: idEmprestimo },
      });

      if (!emprestimo) {
        throw new Error("Empréstimo não encontrado");
      }

      // 2. Atualizar o empréstimo para FINALIZADO
      const emprestimoFinalizado = await tx.emprestimo.update({
        where: { id: idEmprestimo },
        data: {
          estado: "FINALIZADO",
          dataFinalizacao: new Date(),
        },
      });

      // 3. Atualizar o exemplar para DISPONÍVEL
      await tx.exemplar.update({
        where: { id: emprestimo.idExemplar },
        data: { estado: "DISPONIVEL" },
      });

      return emprestimoFinalizado;
    });
  }

  /**
   * Obtém um empréstimo por ID com seus relacionamentos
   */
  async obterEmprestimoPorId(idEmprestimo: string) {
    return prisma.emprestimo.findUnique({
      where: { id: idEmprestimo },
      include: {
        leitor: true,
        exemplar: {
          include: {
            publicacao: true,
          },
        },
      },
    });
  }
}
