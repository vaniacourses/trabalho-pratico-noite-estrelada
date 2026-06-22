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

        // A soma de duração por faixa foi removida: o formulário coleta apenas nomes
        // (ex: "Time, Money"), sem duração individual, tornando essa validação impossível de satisfazer.
        // Guard de null/undefined: body direto à API pode omitir 'faixas'
        if (!cd.faixas || cd.faixas.length === 0) {
            erros.faixas = "O CD deve ter ao menos uma faixa";
        }

        return {erros};

    }
}

export class PublicacaoValidationStrategy implements MidiaValidationStrategy {
    validar(midia: IMidiaDTO): any {

        const erros: Record<string, string> = {};
        const publicacao = midia.dados as IPublicacaoDTO;

        // guard: body direto à API pode omitir isbn ou paginas
        if (!publicacao.isbn) {
            erros.isbn = "ISBN é obrigatório";
        } else {
            const isbn = publicacao.isbn.replace(/[-\s]/g, '');
            if (!/^\d{9}[\dX]$/.test(isbn)) {
                erros.isbn = "ISBN deve conter 10 dígitos ou 9 dígitos seguidos de 'X'";
            }
        }

        if (publicacao.paginas == null || publicacao.paginas < 4 || publicacao.paginas > 10000) {
            erros.paginas = "Número de páginas inválido";
        }

        return {erros};

    }
}