import {NextRequest, NextResponse} from "next/server";
import {ExemplarService} from "@/services/exemplarService";
import {IErroAplicacao} from "@/types";

const exemplarService = new ExemplarService();

// DELETE /api/midias/:id/exemplares/:exemplarId
export async function DELETE(
    _request: NextRequest,
    {params}: { params: { exemplarId?: string } }
) {
    try {
        const exemplarId = params?.exemplarId;

        if (!exemplarId) {
            return NextResponse.json(
                {
                    sucesso: false,
                    erro: {
                        codigo: "VALIDACAO_ERRO",
                        mensagem: "O parâmetro 'exemplarId' é obrigatório",
                    },
                },
                {status: 400}
            );
        }

        await exemplarService.deletarExemplar(exemplarId);

        return NextResponse.json(
            {
                sucesso: true,
                mensagem: "Exemplar deletado com sucesso",
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

        console.error("Erro ao deletar exemplar:", erro);
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


