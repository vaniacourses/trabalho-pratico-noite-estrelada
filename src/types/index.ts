import {Exemplar, Reserva} from "@prisma/client";

export interface IMidiaDTO {
    id?: string;
    tipo: "LIVRO" | "DVD" | "CD";
    titulo: string;
    dataCriacao: Date
    exemplares?: Exemplar[]
    reservas?: Reserva[]
}

export interface ILivroDTO extends IMidiaDTO {
    autor: string;
    isbn?: string;
    paginas: number;
}

export interface ICdDTO extends IMidiaDTO {
    artista: string;
    faixas: string[];
    duracao: number;
}

export interface IDvdDTO extends IMidiaDTO {
    diretor: string
    codigoDeRegiao: string
    legendas: string[]
    duracao: number
}

export interface IMidiaResponse {
    id: string;
    tipo: string;
    titulo: string;
}

export interface IRealizarEmprestimoDTO {
    idLeitor: string;
    idExemplar: string;
    diasEmprestimo?: number;
}

export interface IEmprestimoResponse {
    id: string;
    idLeitor: string;
    idExemplar: string;
    dataInicio: Date;
    dataExpiracao: Date;
    estado: string;
}

export interface IErroAplicacao {
    codigo: string;
    mensagem: string;
    statusHttp: number;
}
