import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { sucesso: false, erro: { mensagem: "Email e senha são obrigatórios" } },
        { status: 400 }
      );
    }

    const leitor = await prisma.leitor.findFirst({
      where: { email },
    });

    if (!leitor || leitor.senha !== password) {
      return NextResponse.json(
        { sucesso: false, erro: { mensagem: "Email ou senha inválidos" } },
        { status: 401 }
      );
    }

    const tipo = leitor.tipo ?? null;
    if (!tipo) {
      console.error(`[login] leitor ${leitor.id} sem campo 'tipo' — verifique se o Prisma client foi regenerado após db:push`);
      return NextResponse.json(
        { sucesso: false, erro: { mensagem: "Erro interno: perfil do usuário inválido. Contate o administrador." } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sucesso: true,
      dados: {
        token: `mock-token-${leitor.id}`,
        usuario: { id: leitor.id, nome: leitor.nome, email: leitor.email, tipo },
      },
    });
  } catch (erro) {
    console.error("Erro no login:", erro);
    return NextResponse.json(
      { sucesso: false, erro: { mensagem: "Erro interno do servidor" } },
      { status: 500 }
    );
  }
}
