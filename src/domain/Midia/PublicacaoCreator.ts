import {IMidiaDTO, IPublicacaoDTO} from "@/types";
import {PublicacaoProduct} from "@/domain/Midia/PublicacaoProduct.ts";
import {MidiaFactory} from "@/domain/Midia/MidiaFactory.ts";

export class PublicacaoCreator extends MidiaFactory {
    public factoryCall(midia: IMidiaDTO): PublicacaoProduct {
        return new PublicacaoProduct(midia, midia.dados as IPublicacaoDTO);
    }
}