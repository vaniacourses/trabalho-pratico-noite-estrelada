import { prisma } from "@/lib/prisma";
import { EstadoLeitor } from "@prisma/client";
import {
  determinarEstadoPunicao,
  diasDeAtraso,
  estadoBaseDoLeitor,
} from "@/domain/punicao";

/**
 * PunicaoService
 *
 * Aplica as regras de punição por atraso (ver `@/domain/punicao`) sobre os
 * dados persistidos:
 * - marca empréstimos vencidos como ATRASADO;
 * - move o leitor para EM_PUNICAO (atraso dentro de 15 dias) ou BANIDO
 *   (atraso superior a 15 dias);
 * - limpa a punição quando não há mais atraso.
 *
 * Como não há um agendador (cron), a avaliação é executada sob demanda:
 * no login, na tentativa de empréstimo e ao listar o histórico no balcão.
 */
export class PunicaoService {
  /**
   * Avalia e atualiza o estado de punição de um único leitor.
   * Retorna o estado resultante.
   */
  async avaliarLeitor(idLeitor: string): Promise<EstadoLeitor | null> {
    const leitor = await prisma.leitor.findUnique({ where: { id: idLeitor } });
    if (!leitor) return null;

    // Funcionários não sofrem punição por empréstimo.
    if (leitor.tipo !== "LEITOR") return leitor.estado;

    const agora = new Date();

    // Empréstimos ativos (ainda não finalizados/rejeitados).
    const ativos = await prisma.emprestimo.findMany({
      where: { idLeitor, estado: { in: ["CORRENTE", "ATRASADO"] } },
      select: { id: true, estado: true, dataExpiracao: true },
    });

    let maxDiasAtraso = 0;
    const idsParaAtrasar: string[] = [];

    for (const emp of ativos) {
      const dias = diasDeAtraso(emp.dataExpiracao, agora);
      if (dias > 0) {
        if (dias > maxDiasAtraso) maxDiasAtraso = dias;
        if (emp.estado !== "ATRASADO") idsParaAtrasar.push(emp.id);
      }
    }

    // Marca empréstimos vencidos como ATRASADO.
    if (idsParaAtrasar.length > 0) {
      await prisma.emprestimo.updateMany({
        where: { id: { in: idsParaAtrasar } },
        data: { estado: "ATRASADO" },
      });
    }

    const novoEstado = determinarEstadoPunicao({
      estadoAtual: leitor.estado,
      maxDiasAtraso,
      estadoBase: estadoBaseDoLeitor(leitor),
    });

    if (novoEstado !== leitor.estado) {
      await prisma.leitor.update({
        where: { id: idLeitor },
        data: { estado: novoEstado },
      });
    }

    return novoEstado;
  }

  /**
   * Varre todos os leitores que possuem empréstimos ativos e atualiza seus
   * estados. Usado ao abrir o balcão para refletir atrasos sem um agendador.
   */
  async avaliarTodos(): Promise<void> {
    const grupos = await prisma.emprestimo.findMany({
      where: { estado: { in: ["CORRENTE", "ATRASADO"] } },
      distinct: ["idLeitor"],
      select: { idLeitor: true },
    });

    await Promise.all(grupos.map((g) => this.avaliarLeitor(g.idLeitor)));
  }
}
