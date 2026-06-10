import {IMidiaDTO, IPublicacaoDTO} from "@/types";
import {MidiaProduct} from "@/domain/Midia/MidiaProduct.ts";

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