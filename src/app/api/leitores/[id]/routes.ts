import {NextRequest, NextResponse} from "next/server";
import {LeitorService} from "@/src/services/leitorService.ts";

// GET /api/users/:id
export async function GET(request: NextRequest) {
    try {
        const {searchParams} = new URL(request.url);
        const id = searchParams.get("id");
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

        const leitorService = new LeitorService();
        const leitor = await leitorService.obterLeitorPorId(id);

        return NextResponse.json(
            {
                sucesso: true,
                dados: leitor,
            },
            {status: 200}
        );

    } catch (erro: any) {
        console.error("Erro ao buscar leitor:", erro);
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

//PATCH /api/users/:id
export async function PATCH(request: NextRequest, data: any) {
    try {
        const {searchParams} = new URL(request.url);
        const id = searchParams.get("id");

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

        const leitorService = new LeitorService();
        const leitor = await leitorService.atualizarLeitor(id, data);

        return NextResponse.json(
            {
                sucesso: true,
                dados: leitor,
            },
            {status: 200}
        );

    } catch (erro: any) {
        console.error('Erro ao atualizar leitor:', erro);
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

// DELETE /api/users/:id
export async function DELETE(request: NextRequest) {
    try {
        const {searchParams} = new URL(request.url);
        const id = searchParams.get("id");

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

        const leitorService = new LeitorService();
        await leitorService.deletarLeitor(id);

        return NextResponse.json(
            {
                sucesso: true,
                mensagem: "Leitor deletado",
            },
            {status: 200}
        );

    } catch (erro: any) {
        console.error('Erro ao deletar leitor:', erro);
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

