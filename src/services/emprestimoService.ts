import {EmprestimoRepository} from "@/repositories/emprestimoRepository";
import type {IRealizarEmprestimoDTO, IEmprestimoResponse, IErroAplicacao} from "@/types";

// ApplicationError: Error subclass that carries IErroAplicacao fields.
class ApplicationError extends Error implements IErroAplicacao {
  codigo: string;
  mensagem: string;
  statusHttp: number;

  constructor(codigo: string, mensagem: string, statusHttp: number) {
    // Use codigo as the Error message so tests that expect toThrow(codigo) work
    super(codigo);
    this.codigo = codigo;
    this.mensagem = mensagem;
    this.statusHttp = statusHttp;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, ApplicationError.prototype);
  }
}

/**
 * EmprestimoService
 *
 * Camada de Negócios - Contém as regras de negócio para empréstimos.
 * Segue o padrão GRASP: Controller (coordena a lógica) e Information Expert (sabe as regras).
 *
 * Responsabilidades:
 * - Validar regras de negócio antes de criar empréstimo
 * - Determinar a data de expiração baseada em dias de empréstimo
 * - Lançar exceções com mensagens claras quando há violação de regras
 */
export class EmprestimoService {
    private repository: EmprestimoRepository;
    private diasEmprestimoPadrao = 14; // 14 dias é o padrão
    private limiteMaximoEmprestimos = 5; // Máximo de empréstimos simultâneos

    constructor(repository?: EmprestimoRepository) {
        this.repository = repository || new EmprestimoRepository();
    }

    /**
     * Realiza um novo empréstimo com validação de regras de negócio
     *
     * Regras de Negócio:
     * 1. Exemplar deve estar disponível
     * 2. Leitor deve estar em estado válido (não banido ou em punição)
     * 3. Leitor não pode ter mais do que o limite máximo de empréstimos simultâneos
     * 4. Data de expiração é calculada a partir de hoje + dias de empréstimo
     */
    async realizarEmprestimo(
        dto: IRealizarEmprestimoDTO
    ): Promise<IEmprestimoResponse> {
        const {idLeitor, idExemplar, diasEmprestimo = this.diasEmprestimoPadrao} = dto;

        // Regras 1 e 2 são independentes — verificar em paralelo
        const [exemplarDisponivel, leitorValido] = await Promise.all([
            this.repository.verificarExemplarDisponivel(idExemplar),
            this.repository.verificarLeitorValido(idLeitor),
        ]);

        if (!exemplarDisponivel) {
            throw this.criarErro(
                "EXEMPLAR_INDISPONIVEL",
                "O exemplar não está disponível para empréstimo",
                400
            );
        }

        if (!leitorValido) {
            throw this.criarErro(
                "LEITOR_INVALIDO",
                "O leitor não pode realizar empréstimos no momento",
                400
            );
        }

        // Regra 3: Verificar limite de empréstimos simultâneos (depende de leitorValido passar)
        const emprestimoAtivos = await this.repository.contarEmprestimosAtivos(idLeitor);

        if (emprestimoAtivos >= this.limiteMaximoEmprestimos) {
            throw this.criarErro(
                "LIMITE_EMPRESTIMOS_ATINGIDO",
                `Limite de ${this.limiteMaximoEmprestimos} empréstimos simultâneos atingido`,
                400
            );
        }

        // Calcular data de expiração
        const dataExpiracao = this.calcularDataExpiracao(diasEmprestimo);

        // Criar o empréstimo (com transação de banco de dados)
        const emprestimo = await this.repository.criarEmprestimo(
            idLeitor,
            idExemplar,
            dataExpiracao
        );

        return this.mapearParaResponse(emprestimo);
    }

    /**
     * Cria uma solicitação de empréstimo pendente (feita pelo leitor)
     */
    async solicitarEmprestimo(dto: IRealizarEmprestimoDTO): Promise<IEmprestimoResponse> {
        const { idLeitor, idExemplar, diasEmprestimo = this.diasEmprestimoPadrao } = dto;

        const [exemplarDisponivel, leitorValido] = await Promise.all([
            this.repository.verificarExemplarDisponivel(idExemplar),
            this.repository.verificarLeitorValido(idLeitor),
        ]);

        if (!exemplarDisponivel) {
            throw this.criarErro("EXEMPLAR_INDISPONIVEL", "O exemplar não está disponível para empréstimo", 400);
        }
        if (!leitorValido) {
            throw this.criarErro("LEITOR_INVALIDO", "O leitor não pode realizar empréstimos no momento", 400);
        }

        const dataExpiracao = this.calcularDataExpiracao(diasEmprestimo);
        const emprestimo = await this.repository.solicitarEmprestimo(idLeitor, idExemplar, dataExpiracao);
        return this.mapearParaResponse(emprestimo);
    }

    /**
     * Aprova uma solicitação pendente (feita por funcionário)
     */
    async aprovarEmprestimo(idEmprestimo: string): Promise<IEmprestimoResponse> {
        try {
            const emprestimo = await this.repository.aprovarEmprestimo(idEmprestimo);
            return this.mapearParaResponse(emprestimo);
        } catch (error: any) {
            if (error instanceof ApplicationError) throw error;
            if (error?.message?.includes("não encontrado")) {
                throw this.criarErro("EMPRESTIMO_NAO_ENCONTRADO", "Solicitação não encontrada", 404);
            }
            if (error?.message?.includes("não está mais disponível")) {
                throw this.criarErro("EXEMPLAR_INDISPONIVEL", error.message, 409);
            }
            throw this.criarErro("ERRO_INTERNO", error.message || "Erro ao aprovar empréstimo", 500);
        }
    }

    /**
     * Rejeita uma solicitação pendente (feita por funcionário)
     */
    async rejeitarEmprestimo(idEmprestimo: string): Promise<IEmprestimoResponse> {
        try {
            const emprestimo = await this.repository.rejeitarEmprestimo(idEmprestimo);
            return this.mapearParaResponse(emprestimo);
        } catch (error: any) {
            if (error instanceof ApplicationError) throw error;
            if (error?.message?.includes("não encontrado")) {
                throw this.criarErro("EMPRESTIMO_NAO_ENCONTRADO", "Solicitação não encontrada", 404);
            }
            throw this.criarErro("ERRO_INTERNO", error.message || "Erro ao rejeitar empréstimo", 500);
        }
    }

    /**
     * Lista solicitações pendentes para o balcão
     */
    async listarPendentes() {
        return this.repository.listarPendentes();
    }

    /**
     * Obtém um empréstimo por ID sem alterá-lo
     */
    async obterEmprestimoPorId(idEmprestimo: string): Promise<IEmprestimoResponse> {
        const emprestimo = await this.repository.obterEmprestimoPorId(idEmprestimo);
        if (!emprestimo) {
            throw this.criarErro(
                "EMPRESTIMO_NAO_ENCONTRADO",
                "Empréstimo não encontrado",
                404
            );
        }
        return this.mapearParaResponse(emprestimo);
    }

    /**
     * Finaliza um empréstimo existente
     */
    async finalizarEmprestimo(idEmprestimo: string): Promise<IEmprestimoResponse> {
        try {
            const emprestimo = await this.repository.finalizarEmprestimo(idEmprestimo);
            return this.mapearParaResponse(emprestimo);
        } catch (error: any) {
            // Re-throw ApplicationErrors as-is (e.g. 404 from repository "not found")
            if (error instanceof ApplicationError) {
                throw error;
            }
            // "Empréstimo não encontrado" is the only business error the repository throws
            if (error?.message === "Empréstimo não encontrado") {
                throw this.criarErro("EMPRESTIMO_NAO_ENCONTRADO", "Empréstimo não encontrado", 404);
            }
            // Unexpected DB/infrastructure errors — preserve original message for logging
            throw this.criarErro("ERRO_INTERNO", error.message || "Erro ao finalizar empréstimo", 500);
        }
    }

    /**
     * Calcularão a data de expiração do empréstimo
     */
    private calcularDataExpiracao(diasEmprestimo: number): Date {
        const dataExpiracao = new Date();
        dataExpiracao.setDate(dataExpiracao.getDate() + diasEmprestimo);
        return dataExpiracao;
    }

    /**
     * Mapeia a entidade Emprestimo para o DTO de resposta
     */
    private mapearParaResponse(emprestimo: any): IEmprestimoResponse {
        return {
            id: emprestimo.id,
            idLeitor: emprestimo.idLeitor,
            idExemplar: emprestimo.idExemplar,
            dataInicio: emprestimo.dataInicio,
            dataExpiracao: emprestimo.dataExpiracao,
            estado: emprestimo.estado,
        };
    }

    /**
     * Factory para criar objetos de erro da aplicação
     */

    // private criarErro(codigo: string, mensagem: string, statusHttp: number): IErroAplicacao {
    //     return {
    //         codigo,
    //         mensagem,
    //         statusHttp,
    //     };
    // }

    private criarErro(codigo: string, mensagem: string, statusHttp: number): IErroAplicacao {
      return new ApplicationError(codigo, mensagem, statusHttp);
    }
}
