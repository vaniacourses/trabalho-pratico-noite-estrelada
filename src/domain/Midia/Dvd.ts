import {IDvdDTO} from "@/src/types";
import {Midia} from "@/src/domain/Midia/Midia.ts";

export class Dvd extends Midia {
    private codigoDeRegiao: string;
    private legendas: string[];
    private duracao: number;

    constructor(dados: IDvdDTO) {
        super(dados);
        this.codigoDeRegiao = dados.codigoDeRegiao;
        this.legendas = dados.legendas;
        this.duracao = dados.duracao
    }

    public getDados() {
        return {
            id: this.id,
            titulo: this.titulo,
            dataCriacao: this.dataCriacao,
            codigoDeRegiao: this.codigoDeRegiao,
            legendas: this.legendas,
            duracao: this.duracao
        }
    }
}