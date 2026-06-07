import {MidiaCreator} from "@/src/domain/Midia/MidiaCreator.ts";
import {ICdDTO} from "@/src/types";
import {Midia} from "@/src/domain/Midia/Midia.ts";
import {Cd} from "@/src/domain/Midia/Cd.ts";

export class CdCreator extends MidiaCreator {
    public registrarMidia(dados: ICdDTO): Midia {
        return new Cd(dados);
    }
}