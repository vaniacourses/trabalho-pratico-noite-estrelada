import {ICdDTO, IMidiaDTO} from "@/src/types";
import {MidiaProduct} from "@/src/domain/Midia/MidiaProduct.ts";

export class CdProduct extends MidiaProduct {

    constructor(midia: IMidiaDTO, cd: ICdDTO) {
        super(midia);
        this.dados = cd
    }

    public gravar(): any {
        return {
            tipo: this.tipo,
            titulo: this.titulo,
            dados: this.dados

        }
    }

    public atualizar(): any {
        return {
            tipo: this.tipo,
            titulo: this.titulo,
            dados: this.dados,

        }
    }
}