import {IMidiaDTO} from "@/types";
import {MidiaProduct} from "@/domain/Midia/MidiaProduct.ts";

export abstract class MidiaFactory {

    public abstract factoryCall(dados: IMidiaDTO): MidiaProduct

    public gravar(dados: IMidiaDTO): any {
        const midia = this.factoryCall(dados)
        return midia.gravar();
    }

    public atualizar(dados:IMidiaDTO):any{
        const midia = this.factoryCall(dados);
        return midia.atualizar();
    }
}