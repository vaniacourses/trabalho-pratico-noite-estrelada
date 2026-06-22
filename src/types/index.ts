import {Exemplar, Reserva, EstadoExemplar} from "@prisma/client";

export interface IMidiaDTO {
    id?: string;
    tipo: "PUBLICACAO" | "DVD" | "CD";
    titulo: string;
    dataCriacao: Date
    dados: IPublicacaoDTO | ICdDTO | IDvdDTO
    exemplares?: Exemplar[]
    reservas?: Reserva[]
}

export interface IPublicacaoDTO {
    autor: string;
    isbn: string;
    paginas: number;
}

export interface ICdDTO {
    artista: string;
    faixas: string[];
    duracao: number;
}

export interface IDvdDTO {
    diretor: string
    codigoDeRegiao: string
    legendas: string[]
    duracao: number
}

export interface IMidiaResponse {
    id: string;
    tipo: string;
    titulo: string;
    dados: IPublicacaoDTO | ICdDTO | IDvdDTO;
}

export interface IExemplarDTO {
    idMidia: string;
    codigo: string;
    tipo: EstadoExemplar;
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
    erros?: Record<string, string>;
}
