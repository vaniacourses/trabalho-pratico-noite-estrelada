import { NextResponse } from "next/server";
import { EmprestimoService } from "@/services/emprestimoService";

export async function GET() {
  try {
    const service = new EmprestimoService();
    const pendentes = await service.listarPendentes();
    return NextResponse.json({ sucesso: true, dados: pendentes });
  } catch (erro) {
    console.error("Erro ao listar pendentes:", erro);
    return NextResponse.json(
      { sucesso: false, erro: { codigo: "ERRO_INTERNO", mensagem: "Erro interno do servidor" } },
      { status: 500 }
    );
  }
}
