import {ICdDTO} from "@/src/types";
import {Midia} from "@/src/domain/Midia/Midia.ts";

export class Cd extends Midia {
    private artista: string;
    private faixas: string[];
    private duracao: number;

    constructor(dados: ICdDTO) {
        super(dados);
        this.artista = dados.artista;
        this.faixas = dados.faixas;
        this.duracao = dados.duracao
    }

    public getDados() {
        return {
            id: this.id,
            titulo: this.titulo,
            dataCriacao: this.dataCriacao,
            artista: this.artista,
            faixas: this.faixas,
            duracao: this.duracao,
        }
    }
}