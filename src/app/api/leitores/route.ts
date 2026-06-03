import {NextRequest, NextResponse} from "next/server";
import {LeitorService} from "@/services/leitorService";
import type {IErroAplicacao} from "@/types";

// POST /api/users/
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, senha, email, cpf, estado, dataDeNascimento } = body;

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

    const leitorService = new LeitorService();

    const leitor = await leitorService.criarLeitor({
      nome,
      senha,
      cpf,
      email,
      estado,
      dataDeNascimento,
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
