import {MidiaFactory} from "@/src/domain/Midia/MidiaFactory.ts";
import {ICdDTO} from "@/src/types";
import {CdProduct} from "@/src/domain/Midia/CdProduct.ts";

export class CdCreator extends MidiaFactory {
    public factoryCall(dados: ICdDTO):CdProduct {
        return new CdProduct(dados);
    }
}