import {MidiaRespository} from "@/repositories/midiaRepository.ts";
import {IErroAplicacao, IMidiaDTO, IMidiaResponse} from "@/types";
import {Midia} from "@prisma/client";
import {
    CdValidationStrategy,
    DvdValidationStrategy,
    PublicacaoValidationStrategy
} from "@/domain/Midia/MidiaValidationStrategy.ts";

export class MidiaService {
    private repository: MidiaRespository;

    constructor(repository?: MidiaRespository) {
        this.repository = repository || new MidiaRespository();
    }

    async obterMidias(): Promise<Midia[]> {
        return this.repository.obterMidias();
    }

    async criarMidia(dto: IMidiaDTO): Promise<IMidiaResponse> {

        const strategy = this.detectarStrategy[dto.tipo];

        const { erros } = strategy.validar(dto);

        if (Object.keys(erros).length > 0) {
            throw this.criarErro(
                "VALIDACAO_ERRO",
                "Houve erros de validação na criação da mídia",
                400,
                erros
            );
        }

        const midia = await this.repository.criarMidia(dto);
        return this.mapearParaResponse(midia);
    }

    async atualizarMidia(id: string, dto: IMidiaDTO): Promise<Midia> {

        const strategy = this.detectarStrategy[dto.tipo];

        const { erros } = strategy.validar(dto);

        if (Object.keys(erros).length > 0) {
            throw this.criarErro(
                "VALIDACAO_ERRO",
                "Houve erros de validação na atualização da mídia",
                400,
                erros
            );
        }


        try {
            return await this.repository.atualizarMidia(id, dto);
        } catch (error: any) {
            throw this.criarErro(
                "ERRO_ATUALIZAR_MIDIA",
                error.message || "Erro ao atualizar midia",
                400
            );
        }

    }

    async deletarMidia(id: string) {
        try {
            return await this.repository.deletarMidia(id);
        } catch (error: any) {
            throw this.criarErro(
                "ERRO_DELETAR_MIDIA",
                error.message || "Erro ao deletar midia",
                400
            );
        }
    }

    async obterMidiaPorId(id: string) {
        const midia = await this.repository.obterMidiaPorId(id);

        if (!midia) {
            // código e mensagem corrigidos — era cópia inadvertida do leitorService
            throw this.criarErro(
                "MIDIA_NAO_ENCONTRADA",
                "Mídia não encontrada",
                404
            );
        }

        return midia;
    }

    // chaves como string literal: TipoDeMidia é um string enum (CD="CD" etc.),
    // mas o enum do Prisma não inicializa no ambiente jsdom dos testes
    private detectarStrategy: Record<string, CdValidationStrategy | DvdValidationStrategy | PublicacaoValidationStrategy> = {
        "CD": new CdValidationStrategy(),
        "DVD": new DvdValidationStrategy(),
        "PUBLICACAO": new PublicacaoValidationStrategy(),
    }

    private mapearParaResponse(midia: any): IMidiaResponse {
        return {
            id: midia.id,
            tipo: midia.tipo,
            titulo: midia.titulo,
            dados: midia.dados
        }
    }

    private criarErro(codigo: string, mensagem: string, statusHttp: number, erros?: Record<string, string>): IErroAplicacao {
        return {
            codigo,
            mensagem,
            statusHttp,
            erros
        };
    }

}