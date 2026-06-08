import {IDvdDTO} from "@/src/types";
import {MidiaProduct} from "@/src/domain/Midia/MidiaProduct.ts";
import {TipoDeMidia} from "@prisma/client";

export class DvdProduct extends MidiaProduct {
    private codigoDeRegiao: string;
    private legendas: string[];
    private duracao: number;

    constructor(dados: IDvdDTO) {
        super(dados);
        this.codigoDeRegiao = dados.codigoDeRegiao;
        this.legendas = dados.legendas;
        this.duracao = dados.duracao
    }

    public gravar(): any {
        return {
            tipo: "DVD" as TipoDeMidia,
            titulo: this.titulo,

            dvd: {
                create: {
                    codigoDeRegiao: this.codigoDeRegiao,
                    legendas: this.legendas,
                    duracao: this.duracao,
                }
            }

        }
    }

    public atualizar(): any {
        return {
            tipo: this.tipo,
            titulo: this.titulo,

            dvd: {
                create: {
                    codigoDeRegiao: this.codigoDeRegiao,
                    legendas: this.legendas,
                    duracao: this.duracao,
                }
            }

        }
    }
}