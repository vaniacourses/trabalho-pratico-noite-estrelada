import {IDvdDTO, IMidiaDTO} from "@/src/types";
import {MidiaProduct} from "@/src/domain/Midia/MidiaProduct.ts";

export class DvdProduct extends MidiaProduct {

    constructor(midia: IMidiaDTO, dvd: IDvdDTO) {
        super(midia);
        this.dados = dvd;
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
            dados: this.dados
        }
    }
}