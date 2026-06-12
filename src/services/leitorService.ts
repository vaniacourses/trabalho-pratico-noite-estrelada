import {LeitorRepository} from "@/repositories/leitorRepository";
import {EstadoLeitor, Leitor} from "@prisma/client";
import type {IErroAplicacao, ILeitorCreateDTO, ILeitorUpdateDTO, ILeitorResponse} from "@/types";

export class LeitorService {
    private repository: LeitorRepository;

    constructor(repository?: LeitorRepository) {
        this.repository = repository || new LeitorRepository();
    }

    async obterLeitorPorId(id: string): Promise<Leitor> {
        const leitor = await this.repository.obterLeitorPorId(id);

        if (!leitor) {
            throw this.criarErro(
                "LEITOR_NAO_ENCONTRADO",
                "Leitor não encontrado",
                404
            );
        }

        return leitor;
    }

    async obterLeitores(): Promise<Leitor[]> {
        return this.repository.obterLeitores()
    }

    async criarLeitor(dto: ILeitorCreateDTO): Promise<ILeitorResponse> {
        const { nome, senha, email, cpf, dataDeNascimento } = dto;
        const estado = this.avaliarEstadoDoLeitor([nome, senha, email, cpf, dataDeNascimento]);
        const leitor = await this.repository.criarLeitor({ nome, senha, estado, email, cpf, dataDeNascimento });
        return this.mapearParaResponse(leitor);
    }

    async atualizarLeitor(id: string, data: ILeitorUpdateDTO): Promise<Leitor> {
        try {
            const { nome, email, cpf, dataDeNascimento } = data;
            const estado = this.avaliarEstadoDoLeitor([nome, email, cpf, dataDeNascimento]);
            return await this.repository.atualizarLeitor(id, { nome, email, cpf, dataDeNascimento, estado } as Partial<Leitor>);
        } catch (error: any) {
            throw this.criarErro(
                "ERRO_ATUALIZAR_LEITOR",
                error.message || "Erro ao atualizar leitor",
                400
            );
        }
    }

    async deletarLeitor(id: string): Promise<Leitor> {
        try {
            return await this.repository.deletarLeitor(id);
        } catch (error: any) {
            throw this.criarErro(
                "ERRO_DELETAR_LEITOR",
                error.message || "Erro ao deletar leitor",
                400
            );
        }
    }

    private avaliarEstadoDoLeitor<T>(dados: (T) []): EstadoLeitor {
        return dados.every((e) => e != null && e !== "") ?
            ("REGULAR" as EstadoLeitor) : ("INCOMPLETO" as EstadoLeitor);
    }

    private criarErro(codigo: string, mensagem: string, statusHttp: number): IErroAplicacao {
        return {
            codigo,
            mensagem,
            statusHttp,
        };
    }

    private mapearParaResponse(leitor: any): ILeitorResponse {
        return {
            id: leitor.id,
            nome: leitor.nome,
            email: leitor.email,
            estado: leitor.estado,
            cpf: leitor.cpf,
            dataDeNascimento: leitor.dataDeNascimento,
        };
    }

}