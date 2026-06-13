import {ExemplarRepository} from "@/repositories/exemplarRepository";
import {Exemplar} from "@prisma/client";
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
            const exemplarExistente = await this.repository.obterExemplarPorCodigo(data.codigo.trim());
            if (exemplarExistente) {
                erros.codigo = "Este código de exemplar já existe";
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

