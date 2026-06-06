import {EstadoLeitor} from "@prisma/client";

export interface ILeitorDTO {
    nome?: string;
    senha?: string;
    email?: string;
    cpf?: string;
    estado?: EstadoLeitor;
    dataDeNascimento?: Date;
}

export interface ILeitorResponse {
    id: string;
    nome: string;
    email: string;
    estado: EstadoLeitor
    cpf: string;
    dataDeNascimento: Date;
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
