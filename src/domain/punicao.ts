import { EstadoLeitor } from "@prisma/client";

/**
 * Regras de punição por atraso na devolução de empréstimos.
 *
 * - Ao passar a data de expiração, inicia-se uma contagem de 15 dias para o
 *   leitor devolver. Durante esse período o leitor fica EM_PUNICAO e não pode
 *   realizar novos empréstimos.
 * - Se os 15 dias se esgotarem sem devolução, o leitor é BANIDO (bloqueado) e
 *   não pode mais acessar o sistema.
 */
export const DIAS_LIMITE_PUNICAO = 15;

const MS_DIA = 1000 * 60 * 60 * 24;

/**
 * Quantidade de dias (inteiros) que se passaram desde a data de expiração.
 * Retorna 0 se ainda não venceu.
 */
export function diasDeAtraso(dataExpiracao: Date | string, agora: Date = new Date()): number {
  const diff = agora.getTime() - new Date(dataExpiracao).getTime();
  if (diff <= 0) return 0;
  return Math.floor(diff / MS_DIA);
}

/**
 * Determina o estado do leitor a partir do maior atraso entre seus
 * empréstimos ativos.
 *
 * @param estadoAtual  estado atual persistido do leitor
 * @param maxDiasAtraso maior atraso (em dias) entre os empréstimos ativos
 * @param estadoBase   estado quando não há atraso (REGULAR ou INCOMPLETO)
 */
export function determinarEstadoPunicao(params: {
  estadoAtual: EstadoLeitor;
  maxDiasAtraso: number;
  estadoBase: EstadoLeitor;
}): EstadoLeitor {
  const { estadoAtual, maxDiasAtraso, estadoBase } = params;

  // BANIDO é terminal: uma vez bloqueado, só um gerente reverte manualmente.
  if (estadoAtual === "BANIDO") return "BANIDO";

  if (maxDiasAtraso > DIAS_LIMITE_PUNICAO) return "BANIDO";
  if (maxDiasAtraso > 0) return "EM_PUNICAO";

  // Sem atraso: retorna ao estado base (limpa uma punição anterior).
  return estadoBase;
}

/**
 * Avalia se o cadastro do leitor está completo para definir o estado base
 * (REGULAR quando completo, INCOMPLETO caso contrário).
 */
export function estadoBaseDoLeitor(dados: {
  nome?: string | null;
  senha?: string | null;
  email?: string | null;
  cpf?: string | null;
  dataDeNascimento?: Date | string | null;
}): EstadoLeitor {
  const completo = [dados.nome, dados.senha, dados.email, dados.cpf, dados.dataDeNascimento].every(
    (v) => v != null && v !== ""
  );
  return completo ? "REGULAR" : "INCOMPLETO";
}
