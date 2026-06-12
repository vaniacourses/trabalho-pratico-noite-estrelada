import {Exemplar, Reserva} from "@prisma/client";

export interface IMidiaDTO {
    id?: string;
    tipo: "PUBLICACAO" | "DVD" | "CD";
    titulo: string;
    dataCriacao: Date
    dados: IPublicacaoDTO | ICdDTO | IDvdDTO
    exemplares?: Exemplar[]
    reservas?: Reserva[]
}

export interface IPublicacaoDTO{
    autor: string;
    isbn: string;
    paginas: number;
}

export interface ICdDTO{
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

export interface ILeitorCreateDTO {
  nome: string;
  senha: string;
  email?: string;
  cpf?: string;
  dataDeNascimento?: Date | null;
}

export interface ILeitorUpdateDTO {
  nome: string;
  email: string;
  cpf: string;
  dataDeNascimento: Date | null;
}

export interface ILeitorResponse {
  id: string;
  nome: string;
  email: string | null;
  cpf: string | null;
  dataDeNascimento: Date | null;
  estado: string;
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
