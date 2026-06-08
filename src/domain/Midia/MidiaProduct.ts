import {IMidiaDTO} from "@/src/types";

export abstract class MidiaProduct {
    protected id?: string;
    protected titulo: string;
    protected tipo: "LIVRO" | "DVD" | "CD";
    protected dataCriacao: Date;

    protected constructor(dados: IMidiaDTO) {
        this.id = dados.id ?? "";
        this.titulo = dados.titulo;
        this.tipo = dados.tipo;
        this.dataCriacao = dados.dataCriacao;
    }

    abstract gravar(): any;

    abstract atualizar(): any

}