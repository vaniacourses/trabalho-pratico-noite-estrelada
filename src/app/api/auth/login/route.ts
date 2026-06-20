import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Busca o leitor no banco pelo e-mail
    const leitor = await prisma.leitor.findFirst({
      where: { email: email }
    });

    // Em produção, use bcrypt para comparar as senhas com hash!
    if (!leitor || leitor.senha !== password) {
      return NextResponse.json(
        { sucesso: false, erro: { mensagem: "E-mail ou senha inválidos." } },
        { status: 401 }
      );
    }

    return NextResponse.json({
      sucesso: true,
      dados: { token: "mock-token-real", usuario: { email: leitor.email, nome: leitor.nome } }
    });
  } catch (error) {
    return NextResponse.json(
      { sucesso: false, erro: { mensagem: "Erro interno no servidor." } },
      { status: 500 }
    );
  }
}