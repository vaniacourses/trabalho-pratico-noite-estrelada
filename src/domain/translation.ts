import {TipoDeMidia, EstadoExemplar} from "@prisma/client";

export const mediaTranslate: Record<TipoDeMidia, string> = {
    [TipoDeMidia.PUBLICACAO]: "Publicação",
    [TipoDeMidia.CD]: "CD",
    [TipoDeMidia.DVD]: "DVD",
}

export const exemplarStateTranslate: Record<EstadoExemplar, string> = {
    [EstadoExemplar.DISPONIVEL]: "Disponível",
    [EstadoExemplar.EMPRESTADO]: "Emprestado",
    [EstadoExemplar.AFASTADO]: "Afastado",
    [EstadoExemplar.RESERVADO]: "Reservado",
}
