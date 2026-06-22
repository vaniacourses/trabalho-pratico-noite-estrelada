import {NextRequest, NextResponse} from "next/server";
import {ReservaService} from "@/services/reservaService.ts";
import type {IErroAplicacao} from "@/types";

const reservaService = new ReservaService();

// GET /api/reservas/[id]
export async function GET(
    request: NextRequest,
    {params}: {params: Promise<{id: string}>}
) {
    try {
        const {id} = await params;

        const reserva = await reservaService.obterReservaPorId(id);

        return NextResponse.json(
            {
                sucesso: true,
                dados: reserva,
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

        console.error("Erro ao buscar reserva:", erro);
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
