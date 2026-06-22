import { NextRequest, NextResponse } from "next/server";
import { bibliotecaFacade } from "@/container/biblioteca.container";
import type { IErroAplicacao } from "@/types";

// PATCH /api/emprestimos/:id  — body: { acao: "aprovar" | "rejeitar" | "finalizar" }
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { acao } = await request.json();

    if (!id) {
      return NextResponse.json(
        { sucesso: false, erro: { codigo: "VALIDACAO_ERRO", mensagem: "ID é obrigatório" } },
        { status: 400 }
      );
    }
    if (acao !== "aprovar" && acao !== "rejeitar" && acao !== "finalizar") {
      return NextResponse.json(
        { sucesso: false, erro: { codigo: "VALIDACAO_ERRO", mensagem: "Ação deve ser 'aprovar', 'rejeitar' ou 'finalizar'" } },
        { status: 400 }
      );
    }

    let resultado;
    if (acao === "aprovar") {
      resultado = await bibliotecaFacade.aprovarEmprestimo(id);
    } else if (acao === "rejeitar") {
      resultado = await bibliotecaFacade.rejeitarEmprestimo(id);
    } else {
      resultado = await bibliotecaFacade.finalizarEmprestimo(id);
    }

    return NextResponse.json({ sucesso: true, dados: resultado });
  } catch (erro: any) {
    const erroAplicacao = erro as IErroAplicacao;
    if (erroAplicacao?.statusHttp) {
      return NextResponse.json(
        { sucesso: false, erro: { codigo: erroAplicacao.codigo, mensagem: erroAplicacao.mensagem } },
        { status: erroAplicacao.statusHttp }
      );
    }
    console.error("Erro ao processar solicitação:", erro);
    return NextResponse.json(
      { sucesso: false, erro: { codigo: "ERRO_INTERNO", mensagem: "Erro interno do servidor" } },
      { status: 500 }
    );
  }
}
