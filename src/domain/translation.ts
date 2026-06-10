import {TipoDeMidia} from "@prisma/client";

export const mediaTranslate: Record<TipoDeMidia, string> = {
    [TipoDeMidia.PUBLICACAO]: "Publicação",
    [TipoDeMidia.CD]: "CD",
    [TipoDeMidia.DVD]: "DVD",
}
