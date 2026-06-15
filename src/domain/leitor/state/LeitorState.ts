import {EstadoLeitor} from "@prisma/client";

/**
 * State (GoF - Comportamental)
 *
 * Cada estado do leitor (INCOMPLETO, REGULAR, EM_PUNICAO, BANIDO) é representado
 * por uma classe que sabe responder, por si mesma, o que aquele estado permite.
 *
 * Antes, regras como "pode solicitar empréstimo?" e a mensagem de bloqueio
 * estavam espalhadas em comparações `estado === "BANIDO" || estado === "EM_PUNICAO"`
 * no repositório e nas rotas. Com o padrão State, essa lógica fica encapsulada e
 * adicionar/alterar um estado não exige caçar `if`s pelo sistema.
 */
export interface LeitorState {
    readonly nome: EstadoLeitor;

    /** Indica se o leitor neste estado pode solicitar/realizar empréstimos. */
    podeSolicitarEmprestimo(): boolean;

    /** Mensagem exibida quando o empréstimo é bloqueado (null quando permitido). */
    mensagemBloqueio(): string | null;
}

class IncompletoState implements LeitorState {
    readonly nome = "INCOMPLETO" as const;

    podeSolicitarEmprestimo(): boolean {
        return true;
    }

    mensagemBloqueio(): string | null {
        return null;
    }
}

class RegularState implements LeitorState {
    readonly nome = "REGULAR" as const;

    podeSolicitarEmprestimo(): boolean {
        return true;
    }

    mensagemBloqueio(): string | null {
        return null;
    }
}

class EmPunicaoState implements LeitorState {
    readonly nome = "EM_PUNICAO" as const;

    podeSolicitarEmprestimo(): boolean {
        return false;
    }

    mensagemBloqueio(): string {
        return "Você está em punição por atraso. Regularize a devolução antes de solicitar outro empréstimo.";
    }
}

class BanidoState implements LeitorState {
    readonly nome = "BANIDO" as const;

    podeSolicitarEmprestimo(): boolean {
        return false;
    }

    mensagemBloqueio(): string {
        return "Conta bloqueada por atraso na devolução. Não é possível solicitar empréstimos.";
    }
}

const ESTADOS: Record<EstadoLeitor, LeitorState> = {
    INCOMPLETO: new IncompletoState(),
    REGULAR: new RegularState(),
    EM_PUNICAO: new EmPunicaoState(),
    BANIDO: new BanidoState(),
};

/**
 * Resolve o objeto de estado correspondente ao valor persistido do leitor.
 */
export function estadoDoLeitor(estado: EstadoLeitor): LeitorState {
    return ESTADOS[estado];
}
