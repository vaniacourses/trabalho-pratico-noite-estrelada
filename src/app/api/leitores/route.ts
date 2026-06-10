import {NextRequest, NextResponse} from "next/server";
import {leitorService} from "@/container/leitor.container.ts";
import type {IErroAplicacao} from "@/types";

// GET /api/leitores
export async function GET() {
  try {
    const leitores = await leitorService.obterLeitores();

    return NextResponse.json(
      {
        sucesso: true,
        dados: leitores,
      },
      { status: 200 }
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
        { status: erroAplicacao.statusHttp }
      );
    }

    console.error("Erro ao buscar leitores:", erro);
    return NextResponse.json(
      {
        sucesso: false,
        erro: {
          codigo: "ERRO_INTERNO",
          mensagem: "Erro interno do servidor",
        },
      },
      { status: 500 }
    );
  }
}

// POST /api/leitores
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, senha } = body;

    if (!nome || !senha) {
      return NextResponse.json(
        {
          erro: {
            codigo: "VALIDACAO_ERRO",
            mensagem: "Os campos 'senha' e 'nome' são obrigatórios",
          },
        },
        { status: 400 }
      );
    }

    const leitor = await leitorService.criarLeitor({
     ...body
    });

    return NextResponse.json(
      {
        sucesso: true,
        dados: leitor,
      },
      { status: 201 }
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
        { status: erroAplicacao.statusHttp }
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
      { status: 500 }
    );
  }
}
