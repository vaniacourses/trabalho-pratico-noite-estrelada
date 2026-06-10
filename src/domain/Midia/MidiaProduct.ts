import {ICdDTO, IDvdDTO, IMidiaDTO, IPublicacaoDTO} from "@/types";

export abstract class MidiaProduct {
    protected id?: string;
    protected titulo: string;
    protected tipo: "PUBLICACAO" | "DVD" | "CD";
    protected dataCriacao: Date;
    protected dados?: ICdDTO | IDvdDTO | IPublicacaoDTO;

    protected constructor(midia: IMidiaDTO) {
        this.id = midia.id ?? "";
        this.titulo = midia.titulo;
        this.tipo = midia.tipo;
        this.dataCriacao = midia.dataCriacao;
    }

    abstract gravar(): any;

    abstract atualizar(): any

}