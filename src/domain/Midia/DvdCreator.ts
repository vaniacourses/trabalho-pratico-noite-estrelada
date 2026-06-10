import {IDvdDTO, IMidiaDTO} from "@/types";
import {MidiaFactory} from "@/domain/Midia/MidiaFactory.ts";
import {MidiaProduct} from "@/domain/Midia/MidiaProduct.ts";
import {DvdProduct} from "@/domain/Midia/DvdProduct.ts";

export class DvdCreator extends MidiaFactory {
    public factoryCall(midia: IMidiaDTO): MidiaProduct {
        return new DvdProduct(midia, midia.dados as IDvdDTO);
    }
}