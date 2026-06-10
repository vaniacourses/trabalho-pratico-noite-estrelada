import {MidiaFactory} from "@/domain/Midia/MidiaFactory.ts";
import {ICdDTO, IMidiaDTO} from "@/types";
import {CdProduct} from "@/domain/Midia/CdProduct.ts";

export class CdCreator extends MidiaFactory {
    public factoryCall(midia: IMidiaDTO): CdProduct {
        return new CdProduct(midia, midia.dados as ICdDTO);
    }
}