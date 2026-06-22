import {NextRequest, NextResponse} from "next/server";
import {ExemplarService} from "@/services/exemplarService";
import {IErroAplicacao} from "@/types";

const exemplarService = new ExemplarService();

// GET /api/midias/:id/exemplares
export async function GET(
    request: NextRequest,
    {params}: { params: Promise<{ id?: string }> }
) {
    try {
        const resolvedParams = await params;
        const idMidia = resolvedParams?.id || new URL(request.url).searchParams.get("id");

        if (!idMidia) {
            return NextResponse.json(
                {
                    sucesso: false,
                    erro: {
                        codigo: "VALIDACAO_ERRO",
                        mensagem: "O parâmetro 'id' da mídia é obrigatório",
                    },
                },
                {status: 400}
            );
        }

        const exemplares = await exemplarService.obterExemplaresPorMidia(idMidia);

        return NextResponse.json(
            {
                sucesso: true,
                dados: exemplares,
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
                        erros: erroAplicacao.erros,
                    },
                },
                {status: erroAplicacao.statusHttp}
            );
        }

        console.error("Erro ao obter exemplares:", erro);
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

// POST /api/midias/:id/exemplares
export async function POST(
    request: NextRequest,
    {params}: { params: { id?: string } }
) {
    try {
        const body = await request.json();

        // Prefer path param, then body.idMidia, then query param
        const idMidia = params?.id || body?.idMidia || new URL(request.url).searchParams.get("id");

        if (!idMidia) {
            return NextResponse.json(
                {
                    sucesso: false,
                    erro: {
                        codigo: "VALIDACAO_ERRO",
                        mensagem: "O parâmetro 'id' da mídia é obrigatório",
                    },
                },
                {status: 400}
            );
        }

        const exemplar = await exemplarService.criarExemplar({
            idMidia,
            codigo: body.codigo,
            tipo: body.tipo,
        });

        return NextResponse.json(
            {
                sucesso: true,
                dados: exemplar,
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

        console.error("Erro ao criar exemplar:", erro);
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

