import { NextRequest, NextResponse } from "next/server";
import { EmprestimoService } from "@/services/emprestimoService";
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
