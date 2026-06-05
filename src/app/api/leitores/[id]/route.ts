import { NextRequest, NextResponse } from "next/server";
import { LeitorService } from "@/services/leitorService";
import type { IErroAplicacao } from "@/types";

// GET /api/leitores/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id?: string } }
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
        { status: 400 }
      );
    }

    const leitorService = new LeitorService();
    const leitor = await leitorService.obterLeitorPorId(id);

    return NextResponse.json(
      {
        sucesso: true,
        dados: leitor,
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

    console.error("Erro ao buscar leitor:", erro);
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

// PATCH /api/leitores/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id?: string } }
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
        { status: 400 }
      );
    }

    const body = await request.json();

    const leitorService = new LeitorService();
    const leitor = await leitorService.atualizarLeitor(id, body);

    return NextResponse.json(
      {
        sucesso: true,
        dados: leitor,
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

    console.error("Erro ao atualizar leitor:", erro);
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

// DELETE /api/leitores/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id?: string } }
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
        { status: 400 }
      );
    }

    const leitorService = new LeitorService();
    await leitorService.deletarLeitor(id);

    return NextResponse.json(
      {
        sucesso: true,
        mensagem: "Leitor deletado com sucesso!",
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

    console.error("Erro ao deletar leitor:", erro);
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

