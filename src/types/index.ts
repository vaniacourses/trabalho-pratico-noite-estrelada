export interface IMidiaDTO {
    id?: string;
    tipo: string;
    titulo: string;
    dataCriacao: Date
}

export interface ILivroDTO extends IMidiaDTO{
    autor: string;
    isbn: string;
    paginas: number;
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
