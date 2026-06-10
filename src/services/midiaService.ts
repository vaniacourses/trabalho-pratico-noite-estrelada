import {MidiaRespository} from "@/repositories/midiaRepository.ts";
import {IErroAplicacao, IMidiaDTO, IMidiaResponse} from "@/types";
import {PublicacaoCreator} from "@/domain/Midia/PublicacaoCreator.ts";
import {CdCreator} from "@/domain/Midia/CdCreator.ts";
import {DvdCreator} from "@/domain/Midia/DvdCreator.ts";
import {Midia, TipoDeMidia} from "@prisma/client";

export class MidiaService {
    private repository: MidiaRespository;

    constructor(repository?: MidiaRespository) {
        this.repository = repository || new MidiaRespository();
    }

    async obterMidias(): Promise<Midia[]> {
        return this.repository.obterMidias();
    }

    async criarMidia(dto: IMidiaDTO): Promise<IMidiaResponse> {
        const {tipo} = dto;
        const factory = this.detectarFactory[tipo as TipoDeMidia];
        const product = factory.gravar(dto);
        const midia = await this.repository.criarMidia(product);
        return this.mapearParaResponse(midia);
    }

    async atualizarMidia(id: string, dto: IMidiaDTO): Promise<Midia> {

        try {
            const {tipo} = dto;
            const factory = this.detectarFactory[tipo as TipoDeMidia];
            const registro = factory.atualizar(dto);
            return await this.repository.atualizarMidia(id, registro);
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

    private detectarFactory = {
        [TipoDeMidia.CD]: new CdCreator(),
        [TipoDeMidia.DVD]: new DvdCreator(),
        [TipoDeMidia.PUBLICACAO]: new PublicacaoCreator()
    } as const

    private mapearParaResponse(midia: any): IMidiaResponse {
        return {
            id: midia.id,
            tipo: midia.tipo,
            titulo: midia.titulo,
            dados: midia.dados
        }
    }

    private criarErro(codigo: string, mensagem: string, statusHttp: number): IErroAplicacao {
        return {
            codigo,
            mensagem,
            statusHttp,
        };
    }

}