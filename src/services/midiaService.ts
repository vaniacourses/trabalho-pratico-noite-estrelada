import {MidiaRespository} from "@/repositories/midiaRepository.ts";
import {IErroAplicacao, IMidiaDTO, IMidiaResponse} from "@/types";
import {Midia, TipoDeMidia} from "@prisma/client";
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

        const strategy = this.detectarStrategy[dto.tipo as TipoDeMidia];

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

        const strategy = this.detectarStrategy[dto.tipo as TipoDeMidia];

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
            throw this.criarErro(
                "LEITOR_NAO_ENCONTRADO",
                "Leitor não encontrado",
                404
            );
        }

        return midia;
    }

    private detectarStrategy = {
        [TipoDeMidia.CD]: new CdValidationStrategy(),
        [TipoDeMidia.DVD]: new DvdValidationStrategy(),
        [TipoDeMidia.PUBLICACAO]: new PublicacaoValidationStrategy()
    } as const

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