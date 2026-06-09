import {IMidiaDTO, IPublicacaoDTO} from "@/src/types";
import {MidiaProduct} from "@/src/domain/Midia/MidiaProduct.ts";

export class PublicacaoProduct extends MidiaProduct {

    constructor(midia: IMidiaDTO, publicacao: IPublicacaoDTO) {
        super(midia);
        this.dados = publicacao
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