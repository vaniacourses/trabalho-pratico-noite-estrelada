import {LeitorRepository} from "@/repositories/leitorRepository";
import { Leitor, EstadoLeitor } from "@prisma/client";
import type {ICriarLeitorDTO, ICriarLeitorResponse, IErroAplicacao} from "@/types";

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

    async criarLeitor(dto: ICriarLeitorDTO): Promise<ICriarLeitorResponse> {

        const {
            nome,
            senha,
            email,
            cpf,
            dataDeNascimento,
        } = dto

        // respect explicit estado if provided, otherwise evaluate from provided data
        const estado = dto.estado ?? this.avaliarEstadoDoLeitor([nome, senha, email, cpf, dataDeNascimento]);

        const leitor = await this.repository.criarLeitor(
            nome,
            senha,
            estado,
            email,
            cpf,
            dataDeNascimento
        );

        return this.mapearParaResponse(leitor);
    }

    async atualizarLeitor(id: string, data: {
        nome?: string,
        cpf?: string,
        email?: string,
        senha?: string,
        dataDeNascimento?: Date
    }): Promise<Leitor> {
        try {
            return await this.repository.atualizarLeitor(id, data as Partial<Leitor>);
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

    private avaliarEstadoDoLeitor<T>(dados: (T | undefined | null) []): EstadoLeitor {
        return dados.every((e) => e != null) ? ("REGULAR" as EstadoLeitor) : ("INCOMPLETO" as EstadoLeitor);
    }

    private criarErro(codigo: string, mensagem: string, statusHttp: number): IErroAplicacao {
        return {
            codigo,
            mensagem,
            statusHttp,
        };
    }

    private mapearParaResponse(leitor: any): ICriarLeitorResponse {
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