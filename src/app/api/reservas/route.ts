import {NextRequest, NextResponse} from "next/server";
import {ReservaService} from "@/services/reservaService.ts";
import type {IErroAplicacao} from "@/types";

const reservaService = new ReservaService();

// GET /api/reservas
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        const filtros = {
            estado: searchParams.get("estado") as any,
            tipoMidia: searchParams.get("tipoMidia") as any,
            nomeMidia: searchParams.get("nomeMidia") as any,
            nomeLeitor: searchParams.get("nomeLeitor") as any,
        };

        // Remove filtros vazios
        Object.keys(filtros).forEach(
            key => (filtros as any)[key] === null && delete (filtros as any)[key]
        );

        const reservas = await reservaService.obterTodasAsReservas(filtros);

        return NextResponse.json(
            {
                sucesso: true,
                dados: reservas,
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

        console.error("Erro ao buscar reservas:", erro);
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
