import {IDvdDTO} from "@/src/types";
import {MidiaFactory} from "@/src/domain/Midia/MidiaFactory.ts";
import {MidiaProduct} from "@/src/domain/Midia/MidiaProduct.ts";
import {DvdProduct} from "@/src/domain/Midia/DvdProduct.ts";

export class DvdCreator extends MidiaFactory {
    public factoryCall(dados: IDvdDTO): MidiaProduct {
        return new DvdProduct(dados);
    }
}