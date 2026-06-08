import {NextRequest, NextResponse} from "next/server";
import {midiaService} from "@/src/container/midia.container.ts";
import {IErroAplicacao} from "@/src/types";

// GET /api/midias/:id
export async function GET(
    request: NextRequest,
    {params}: { params: { id?: string } }
) {
    try {
        const id = params?.id || new URL(request.url).searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                {
                    erro: {
                        codigo: "VALIDACAO_ERRO",
                        mensagem: "O parâmetro 'id' é obrigatório",
                    },
                },
                {status: 400}
            );
        }

        const midia = await midiaService.obterMidiaPorId(id);

        return NextResponse.json(
            {
                sucesso: true,
                dados: midia,
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

        console.error("Erro ao buscar mídia:", erro);
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

// PUT /api/midias/:id
export async function PUT(
    request: NextRequest,
    {params}: { params: { id?: string } }
) {
    try {
        const id = params?.id || new URL(request.url).searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                {
                    erro: {
                        codigo: "VALIDACAO_ERRO",
                        mensagem: "O parâmetro 'id' é obrigatório",
                    },
                },
                {status: 400}
            );
        }

        const body = await request.json();

        const midia = await midiaService.atualizarMidia(id, body);

        return NextResponse.json(
            {
                sucesso: true,
                dados: midia,
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

        console.error("Erro ao atualizar mídia:", erro);
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

// DELETE /api/midias/:id
export async function DELETE(
    request: NextRequest,
    {params}: { params: { id?: string } }
) {
    try {
        const id = params?.id || new URL(request.url).searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                {
                    erro: {
                        codigo: "VALIDACAO_ERRO",
                        mensagem: "O parâmetro 'id' é obrigatório",
                    },
                },
                {status: 400}
            );
        }

        await midiaService.deletarMidia(id);

        return NextResponse.json(
            {
                sucesso: true,
                mensagem: "Mídia deletada com sucesso!",
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

        console.error("Erro ao deletar mídia:", erro);
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

