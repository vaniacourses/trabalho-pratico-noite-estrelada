import {IMidiaDTO, IPublicacaoDTO} from "@/src/types";
import {PublicacaoProduct} from "@/src/domain/Midia/PublicacaoProduct.ts";
import {MidiaFactory} from "@/src/domain/Midia/MidiaFactory.ts";

export class PublicacaoCreator extends MidiaFactory {
    public factoryCall(midia: IMidiaDTO): PublicacaoProduct {
        return new PublicacaoProduct(midia, midia.dados as IPublicacaoDTO);
    }
}