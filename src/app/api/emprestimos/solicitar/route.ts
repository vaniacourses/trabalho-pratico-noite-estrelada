import { NextRequest, NextResponse } from "next/server";
import { EmprestimoService } from "@/services/emprestimoService";
import { PunicaoService } from "@/services/punicaoService";
import type { IErroAplicacao } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idLeitor, idExemplar, diasEmprestimo } = body;

    if (!idLeitor || !idExemplar) {
      return NextResponse.json(
        { sucesso: false, erro: { codigo: "VALIDACAO_ERRO", mensagem: "idLeitor e idExemplar são obrigatórios" } },
        { status: 400 }
      );
    }

    // Bloquear leitores em punição/banidos por atraso
    const estado = await new PunicaoService().avaliarLeitor(idLeitor);
    if (estado === "BANIDO" || estado === "EM_PUNICAO") {
      return NextResponse.json(
        {
          sucesso: false,
          erro: {
            codigo: estado === "BANIDO" ? "LEITOR_BANIDO" : "LEITOR_EM_PUNICAO",
            mensagem:
              estado === "BANIDO"
                ? "Conta bloqueada por atraso na devolução. Não é possível solicitar empréstimos."
                : "Você está em punição por atraso. Regularize a devolução antes de solicitar outro empréstimo.",
          },
        },
        { status: 403 }
      );
    }

    const service = new EmprestimoService();
    const solicitacao = await service.solicitarEmprestimo({ idLeitor, idExemplar, diasEmprestimo });

    return NextResponse.json({ sucesso: true, dados: solicitacao }, { status: 201 });
  } catch (erro: any) {
    const erroAplicacao = erro as IErroAplicacao;
    if (erroAplicacao?.statusHttp) {
      return NextResponse.json(
        { sucesso: false, erro: { codigo: erroAplicacao.codigo, mensagem: erroAplicacao.mensagem } },
        { status: erroAplicacao.statusHttp }
      );
    }
    console.error("Erro ao solicitar empréstimo:", erro);
    return NextResponse.json(
      { sucesso: false, erro: { codigo: "ERRO_INTERNO", mensagem: "Erro interno do servidor" } },
      { status: 500 }
    );
  }
}
