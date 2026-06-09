import {IMidiaDTO, IPublicacaoDTO} from "@/src/types";
import {MidiaProduct} from "@/src/domain/Midia/MidiaProduct.ts";
import {TipoDeMidia} from "@prisma/client";

export class PublicacaoProduct extends MidiaProduct {

    constructor(midia: IMidiaDTO, publicacao: IPublicacaoDTO) {
        super(midia);
        midia.tipo = TipoDeMidia.PUBLICACAO;
        midia.dados = publicacao
    }

    public gravar(): any {
        return {
            tipo: this.tipo,
            titulo: this.titulo,
            dados: this.dados,

        }
    }

    public atualizar(): any {
        return {
            tipo: this.tipo,
            titulo: this.titulo,
            dados: this.dados

        }
    }
}