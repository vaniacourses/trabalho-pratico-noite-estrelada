import { NextRequest, NextResponse } from "next/server";
import { EmprestimoService } from "@/services/emprestimoService";
import type { IErroAplicacao } from "@/types";

/**
 * POST /api/emprestimos
 *
 * Camada de Apresentação (Controller) - Route Handler do Next.js
 * Responsabilidades:
 * 1. Receber a requisição HTTP
 * 2. Validar o corpo da requisição
 * 3. Chamar o serviço de negócios
 * 4. Retornar a resposta HTTP formatada
 *
 * Padrão GRASP: Controller
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parsear o corpo da requisição
    const body = await request.json();
    const { idLeitor, idExemplar, diasEmprestimo } = body;

    // 2. Validar campos obrigatórios
    if (!idLeitor || !idExemplar) {
      return NextResponse.json(
        {
          erro: {
            codigo: "VALIDACAO_ERRO",
            mensagem: "Os campos 'idLeitor' e 'idExemplar' são obrigatórios",
          },
        },
        { status: 400 }
      );
    }

    // 3. Instanciar o serviço de negócios
    const emprestimoService = new EmprestimoService();

    // 4. Chamar o serviço para realizar o empréstimo
    const emprestimo = await emprestimoService.realizarEmprestimo({
      idLeitor,
      idExemplar,
      diasEmprestimo,
    });

    // 5. Retornar sucesso
    return NextResponse.json(
      {
        sucesso: true,
        dados: emprestimo,
      },
      { status: 201 }
    );
  } catch (erro: any) {
    // Tratamento de erros
    const erroAplicacao = erro as IErroAplicacao;

    if (erroAplicacao.statusHttp) {
      // É um erro da aplicação
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

    // Erro inesperado
    console.error("Erro ao realizar empréstimo:", erro);
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

/**
 * GET /api/emprestimos
 *
 * Lista todos os empréstimos
 */
export async function GET(request: NextRequest) {
  try {
    const emprestimoService = new EmprestimoService();
    const emprestimos = await emprestimoService.listarTodos();

    return NextResponse.json(
      {
        sucesso: true,
        dados: emprestimos,
      },
      { status: 200 }
    );
  } catch (erro: any) {
    console.error("Erro ao listar empréstimos:", erro);
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
