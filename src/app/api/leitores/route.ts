import {NextRequest, NextResponse} from "next/server";
import {LeitorService} from "@/src/services/leitorService.ts";
import type {IErroAplicacao} from "@/src/types";

// POST /api/users/
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {nome, senha, email, cpf, estado, dataDeNascimento} = body

        if (!nome || !senha) {
            return NextResponse.json(
                {
                    erro: {
                        codigo: "VALIDACAO_ERRO",
                        mesagem: "Os campos 'senha' e nome são obrigatórios"
                    },
                },
                {status: 400}
            )
        }

        const leitorService = new LeitorService();

        const leitor = leitorService.criarLeitor({
            nome, cpf, email, estado, dataDeNascimento
        })

        return NextResponse.json(
            {
                sucesso: true,
                dados: leitor,
            },
            {status: 201}
        );

    } catch (erro: any) {
        const erroAplicacao = erro as IErroAplicacao;
        if (erroAplicacao.statusHttp) {
            return NextResponse.json(
                {
                    sucesso: false,
                    error: {
                        codigo: erroAplicacao.statusHttp,
                        mensagem: erroAplicacao.mensagem,

                    },
                },
                {status: erroAplicacao.statusHttp}
            );
        }

        console.error("Erro ao criar Leitor:", erro);
        return NextResponse.json(
            {
                sucesso: false,
                erro: {
                    codigo: "ERRO_INTERNO",
                    mensagem: "Erro interno do servidor",
                },
            },
            {status: 500}
        )

    }
}
