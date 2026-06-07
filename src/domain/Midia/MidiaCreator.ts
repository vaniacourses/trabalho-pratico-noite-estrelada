import {IMidiaDTO} from "@/src/types";
import {Midia} from "@/src/domain/Midia/Midia.ts";

export abstract class MidiaCreator {

    public abstract registrarMidia(dados: IMidiaDTO): Midia

    public criar(dados: IMidiaDTO): any {
        const midia = this.registrarMidia(dados)
        midia.criar();
    }

    public atualizar(dados: IMidiaDTO): any {
        const midia = this.registrarMidia(dados)
        midia.atualizar();
    }
}