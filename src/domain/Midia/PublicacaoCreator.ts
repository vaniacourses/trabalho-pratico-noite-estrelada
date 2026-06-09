import {IPublicacaoDTO} from "@/src/types";
import {PublicacaoProduct} from "@/src/domain/Midia/PublicacaoProduct.ts";
import {MidiaFactory} from "@/src/domain/Midia/MidiaFactory.ts";

export class PublicacaoCreator extends MidiaFactory{
    public factoryCall(dados: IPublicacaoDTO): PublicacaoProduct {
        return new PublicacaoProduct(dados);
    }
}