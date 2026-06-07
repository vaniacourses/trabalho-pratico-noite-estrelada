import {IDvdDTO} from "@/src/types";
import {MidiaCreator} from "@/src/domain/Midia/MidiaCreator.ts";
import {Midia} from "@/src/domain/Midia/Midia.ts";
import {Dvd} from "@/src/domain/Midia/Dvd.ts";

export class DvdCreator extends MidiaCreator {
    public midiaFactory(dados: IDvdDTO): Midia {
        return new Dvd(dados);
    }
}