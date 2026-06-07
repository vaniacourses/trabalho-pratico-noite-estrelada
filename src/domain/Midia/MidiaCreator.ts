import {IMidiaDTO} from "@/src/types";
import {Midia} from "@/src/domain/Midia/Midia.ts";

export abstract class MidiaCreator {

    public abstract midiaFactory(dados: IMidiaDTO): Midia

    public getDados(dados: IMidiaDTO): any {
        const midia = this.midiaFactory(dados)
        return midia.getDados();
    }
}