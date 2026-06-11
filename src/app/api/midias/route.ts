import {NextRequest, NextResponse} from "next/server";
import {midiaService} from "@/container/midia.container.ts";
import {IErroAplicacao} from "@/types";

// GET /api/midias
export async function GET() {
    try {
        const midias = await midiaService.obterMidias();

        return NextResponse.json(
            {
                sucesso: true,
                dados: midias,
            },
            {status: 200}
        );
    } catch (erro: any) {
        const erroAplicacao = erro as IErroAplicacao;
        if (erroAplicacao?.statusHttp) {
            return NextResponse.json(
                {
                    sucesso: false,
                    erro: {
                        codigo: erroAplicacao.codigo,
                        mensagem: erroAplicacao.mensagem,
                    },
                },
                {status: erroAplicacao.statusHttp}
            );
        }

        console.error("Erro ao buscar midias:", erro);
        return NextResponse.json(
            {
                sucesso: false,
                erro: {
                    codigo: "ERRO_INTERNO",
                    mensagem: "Erro interno do servidor",
                },
            },
            {status: 500}
        );
    }
}

// POST /api/midias
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const midia = await midiaService.criarMidia({
            ...body
        });

        return NextResponse.json(
            {
                sucesso: true,
                dados: midia,
            },
            {status: 201}
        );
    } catch (erro: any) {
        const erroAplicacao = erro as IErroAplicacao;
        if (erroAplicacao?.statusHttp) {
            return NextResponse.json(
                {
                    sucesso: false,
                    erro: {
                        codigo: erroAplicacao.codigo,
                        mensagem: erroAplicacao.mensagem,
                        erros: erroAplicacao.erros,
                    },
                },
                {status: erroAplicacao.statusHttp}
            );
        }

        console.error("Erro ao criar Midia:", erro);
        return NextResponse.json(
            {
                sucesso: false,
                erro: {
                    codigo: "ERRO_INTERNO",
                    mensagem: "Erro interno do servidor",
                },
            },
            {status: 500}
        );
    }
}
