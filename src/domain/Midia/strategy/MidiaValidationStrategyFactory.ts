import {TipoDeMidia} from "@prisma/client";
import {
    CdValidationStrategy,
    DvdValidationStrategy,
    MidiaValidationStrategy,
    PublicacaoValidationStrategy,
} from "./MidiaValidationStrategy.ts";

/**
 * Factory Method (GoF - Criacional)
 *
 * Centraliza a criação das estratégias de validação de mídia. O `MidiaService`
 * deixa de conhecer as classes concretas (`CdValidationStrategy`, etc.) e passa
 * a pedir à fábrica a estratégia adequada ao `TipoDeMidia`.
 *
 * Vantagem: incluir um novo tipo de mídia exige alterar apenas esta fábrica,
 * sem tocar no serviço (Open/Closed Principle).
 */
export class MidiaValidationStrategyFactory {
    private static readonly estrategias: Record<TipoDeMidia, () => MidiaValidationStrategy> = {
        [TipoDeMidia.CD]: () => new CdValidationStrategy(),
        [TipoDeMidia.DVD]: () => new DvdValidationStrategy(),
        [TipoDeMidia.PUBLICACAO]: () => new PublicacaoValidationStrategy(),
    };

    static criar(tipo: TipoDeMidia): MidiaValidationStrategy {
        const fabricar = this.estrategias[tipo];

        if (!fabricar) {
            throw new Error(`Tipo de mídia sem estratégia de validação: ${tipo}`);
        }

        return fabricar();
    }
}
