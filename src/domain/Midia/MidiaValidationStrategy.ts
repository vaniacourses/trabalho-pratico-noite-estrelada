import {ICdDTO, IDvdDTO, IMidiaDTO, IPublicacaoDTO} from "@/types";

interface MidiaValidationStrategy {
    validar(midia: IMidiaDTO): { erros: Record<string, string> };
}

export class DvdValidationStrategy implements MidiaValidationStrategy {
    validar(midia: IMidiaDTO): { erros: Record<string, string> } {
        const erros: Record<string, string> = {};
        const dvd = midia.dados as IDvdDTO;
        const codigosDeRegiao = ["0", "1", "4", "Todas"]

        if (dvd.duracao > 120) {
            erros.duracao = "Duração do DVD deve ser menor ou igual a 120 minutos";
        }

        if (!codigosDeRegiao.includes(dvd.codigoDeRegiao)) {
            erros.codigoDeRegiao = "Código de região inválido";
        }

        return {erros}
    }
}


export class CdValidationStrategy implements MidiaValidationStrategy {
    validar(midia: IMidiaDTO): any {

        const erros: Record<string, string> = {};
        const cd = midia.dados as ICdDTO;

        if (cd.duracao > 80) {
            erros.duracao = "Duração do CD deve ser menor ou igual a 80 minutos"
        }

        const faixasDuracao: number = cd.faixas
            .reduce((acc: number, faixa: string) => acc + Number(faixa.split(":")[1]), 0);

        if (cd.duracao !== faixasDuracao) {
            erros.faixas = "A soma da duração das faixas deve ser igual à duração total do CD";
        }

        return {erros};

    }
}

export class PublicacaoValidationStrategy implements MidiaValidationStrategy {
    validar(midia: IMidiaDTO): any {

        const erros: Record<string, string> = {};
        const publicacao = midia.dados as IPublicacaoDTO;

        const isbn = publicacao.isbn.replace(/[-\s]/g, '');

        // numero de paginas
        if (publicacao.paginas < 4 || publicacao.paginas > 10000) {
            erros.paginas = "Número de páginas inválido";
        }

        // codigo isbn valido
        if (!/^\d{9}[\dX]$/.test(isbn)) {
            erros.isbn = "ISBN deve conter 10 dígitos ou 9 dígitos seguidos de 'X'";
        }

        return {erros};

    }
}