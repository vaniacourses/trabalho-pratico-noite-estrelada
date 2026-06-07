import {IMidiaDTO} from "@/src/types";

export abstract class Midia {
    protected id?: string;
    protected titulo: string;
    protected dataCriacao: Date;

    protected constructor(dados: IMidiaDTO) {
        this.id = dados.id ?? "";
        this.titulo = dados.titulo;
        this.dataCriacao = dados.dataCriacao;
    }

    abstract criar(): any;

    abstract atualizar(): any;
}