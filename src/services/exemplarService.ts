import {ExemplarRepository} from "@/repositories/exemplarRepository";
import {Exemplar, EstadoExemplar} from "@prisma/client";
import {IErroAplicacao, IExemplarDTO} from "@/types";

export class ExemplarService {
    private repository: ExemplarRepository;

    constructor(repository?: ExemplarRepository) {
        this.repository = repository || new ExemplarRepository();
    }

    async criarExemplar(data: IExemplarDTO): Promise<Exemplar> {
        const erros: Record<string, string> = {};

        // Validar código
        if (!data.codigo || data.codigo.trim() === "") {
            erros.codigo = "Código do exemplar é obrigatório";
        }

        if (data.codigo && data.codigo.trim().length < 3) {
            erros.codigo = "Código do exemplar deve ter no mínimo 3 caracteres";
        }

        // Verificar se o código já existe
        if (data.codigo) {
            try {
                const exemplarExistente = await this.repository.obterExemplarPorCodigo(data.codigo.trim());
                if (exemplarExistente) {
                    erros.codigo = "Este código de exemplar já existe";
                }
            } catch {
                erros.codigo = "Não foi possível validar o código. Tente novamente.";
            }
        }

        if (Object.keys(erros).length > 0) {
            throw this.criarErro(
                "VALIDACAO_ERRO",
                "Houve erros de validação na criação do exemplar",
                400,
                erros
            );
        }

        try {
            return await this.repository.criarExemplar({
                ...data,
                codigo: data.codigo.trim(),
            });
        } catch (error: any) {
            throw this.criarErro(
                "ERRO_CRIAR_EXEMPLAR",
                error.message || "Erro ao criar exemplar",
                400
            );
        }
    }

    async obterExemplaresPorMidia(idMidia: string): Promise<Exemplar[]> {
        return this.repository.obterExemplaresPorMidia(idMidia);
    }

    async obterExemplarPorId(id: string): Promise<Exemplar> {
        const exemplar = await this.repository.obterExemplarPorId(id);
        if (!exemplar) {
            throw this.criarErro("EXEMPLAR_NAO_ENCONTRADO", "Exemplar não encontrado", 404);
        }
        return exemplar;
    }

    async atualizarExemplar(
        id: string,
        data: { codigo?: string; estado?: EstadoExemplar }
    ): Promise<Exemplar> {
        const erros: Record<string, string> = {};

        const exemplarAtual = await this.repository.obterExemplarPorId(id);
        if (!exemplarAtual) {
            throw this.criarErro("EXEMPLAR_NAO_ENCONTRADO", "Exemplar não encontrado", 404);
        }

        const dadosAtualizacao: { codigo?: string; estado?: EstadoExemplar } = {};

        if (data.codigo !== undefined) {
            const codigo = data.codigo.trim();
            if (codigo === "") {
                erros.codigo = "Código do exemplar é obrigatório";
            } else if (codigo.length < 3) {
                erros.codigo = "Código do exemplar deve ter no mínimo 3 caracteres";
            } else if (codigo !== exemplarAtual.codigo) {
                try {
                    const existente = await this.repository.obterExemplarPorCodigo(codigo);
                    if (existente && existente.id !== id) {
                        erros.codigo = "Este código de exemplar já existe";
                    }
                } catch {
                    erros.codigo = "Não foi possível validar o código. Tente novamente.";
                }
            }
            dadosAtualizacao.codigo = codigo;
        }

        if (data.estado !== undefined) {
            dadosAtualizacao.estado = data.estado;
        }

        if (Object.keys(erros).length > 0) {
            throw this.criarErro(
                "VALIDACAO_ERRO",
                "Houve erros de validação na atualização do exemplar",
                400,
                erros
            );
        }

        try {
            return await this.repository.atualizarExemplar(id, dadosAtualizacao);
        } catch (error: any) {
            throw this.criarErro(
                "ERRO_ATUALIZAR_EXEMPLAR",
                error.message || "Erro ao atualizar exemplar",
                400
            );
        }
    }

    async deletarExemplar(id: string): Promise<Exemplar> {
        try {
            return await this.repository.deletarExemplar(id);
        } catch (error: any) {
            throw this.criarErro(
                "ERRO_DELETAR_EXEMPLAR",
                error.message || "Erro ao deletar exemplar",
                400
            );
        }
    }

    private criarErro(codigo: string, mensagem: string, statusHttp: number, erros?: Record<string, string>): IErroAplicacao {
        return {
            codigo,
            mensagem,
            statusHttp,
            erros,
        };
    }
}

