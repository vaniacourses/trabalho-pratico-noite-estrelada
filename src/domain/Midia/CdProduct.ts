import {ICdDTO} from "@/src/types";
import {MidiaProduct} from "@/src/domain/Midia/MidiaProduct.ts";
import {TipoDeMidia} from "@prisma/client";

export class CdProduct extends MidiaProduct {
    private artista: string;
    private faixas: string[];
    private duracao: number;

    constructor(dados: ICdDTO) {
        super(dados);
        this.artista = dados.artista;
        this.faixas = dados.faixas;
        this.duracao = dados.duracao
    }

    public gravar(): any {
        return {
            tipo: "CD" as TipoDeMidia,
            titulo: this.titulo,

            cd: {
                create: {
                    artista: this.artista,
                    faixas: this.faixas,
                    duracao: this.duracao,
                }
            }

        }
    }

    public atualizar(): any{
        return {
            tipo: this.tipo,
            titulo: this.titulo,

            cd: {
                update: {
                    artista: this.artista,
                    faixas: this.faixas,
                    duracao: this.duracao,
                }
            }

        }
    }
}