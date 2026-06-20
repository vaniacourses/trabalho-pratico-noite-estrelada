import { NextRequest, NextResponse } from "next/server";
import { EmprestimoService } from "@/services/emprestimoService";
import type { IErroAplicacao } from "@/types";

/**
 * PUT /api/emprestimos/[id]
 *
 * Finaliza um empréstimo específico
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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

    const emprestimoService = new EmprestimoService();
    const emprestimo = await emprestimoService.finalizarEmprestimo(id);

    return NextResponse.json(
      {
        sucesso: true,
        mensagem: "Empréstimo finalizado com sucesso",
        dados: emprestimo,
      },
      { status: 200 }
    );
  } catch (erro: any) {
    const erroAplicacao = erro as IErroAplicacao;

    if (erroAplicacao.statusHttp) {
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

    console.error("Erro ao finalizar empréstimo:", erro);
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
