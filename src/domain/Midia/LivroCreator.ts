import {ILivroDTO} from "@/src/types";
import {Livro} from "@/src/domain/Midia/Livro.ts";
import {MidiaCreator} from "@/src/domain/Midia/MidiaCreator.ts";
import {Midia} from "@/src/domain/Midia/Midia.ts";

export class LivroCreator extends MidiaCreator {
    public midiaFactory(dados: ILivroDTO): Midia {
        return new Livro(dados);
    }
}