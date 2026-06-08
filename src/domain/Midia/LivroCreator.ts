import {ILivroDTO} from "@/src/types";
import {LivroProduct} from "@/src/domain/Midia/LivroProduct.ts";
import {MidiaFactory} from "@/src/domain/Midia/MidiaFactory.ts";

export class LivroCreator extends MidiaFactory{
    public factoryCall(dados: ILivroDTO): LivroProduct {
        return new LivroProduct(dados);
    }
}