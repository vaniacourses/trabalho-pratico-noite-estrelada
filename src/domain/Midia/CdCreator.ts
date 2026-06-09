import {MidiaFactory} from "@/src/domain/Midia/MidiaFactory.ts";
import {ICdDTO, IMidiaDTO} from "@/src/types";
import {CdProduct} from "@/src/domain/Midia/CdProduct.ts";

export class CdCreator extends MidiaFactory {
    public factoryCall(midia: IMidiaDTO): CdProduct {
        return new CdProduct(midia, midia.dados as ICdDTO);
    }
}