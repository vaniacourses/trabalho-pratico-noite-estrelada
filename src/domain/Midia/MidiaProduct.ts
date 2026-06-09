import {DadosDTO, IMidiaDTO} from "@/src/types";

export abstract class MidiaProduct {
    protected id?: string;
    protected titulo: string;
    protected tipo: "PUBLICACAO" | "DVD" | "CD";
    protected dataCriacao: Date;
    protected dados: DadosDTO | undefined;

    protected constructor(midia: IMidiaDTO) {
        this.id = midia.id ?? "";
        this.titulo = midia.titulo;
        this.tipo = midia.tipo;
        this.dataCriacao = midia.dataCriacao;
    }

    abstract gravar(): any;

    abstract atualizar(): any

}