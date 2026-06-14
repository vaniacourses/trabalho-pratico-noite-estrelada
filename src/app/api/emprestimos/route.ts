import { NextRequest, NextResponse } from "next/server";
import { EmprestimoService } from "@/services/emprestimoService";
import { PunicaoService } from "@/services/punicaoService";
import type { IErroAplicacao } from "@/types";

/**
 * Reavalia a punição do leitor e retorna uma resposta de bloqueio caso ele
 * esteja EM_PUNICAO ou BANIDO. Retorna null quando o leitor pode prosseguir.
 */
async function bloqueioPorPunicao(idLeitor: string): Promise<NextResponse | null> {
  const estado = await new PunicaoService().avaliarLeitor(idLeitor);
  if (estado === "BANIDO") {
    return NextResponse.json(
      {
        sucesso: false,
        erro: {
          codigo: "LEITOR_BANIDO",
          mensagem: "Leitor bloqueado por atraso na devolução. Não é possível realizar empréstimos.",
        },
      },
      { status: 403 }
    );
  }
  if (estado === "EM_PUNICAO") {
    return NextResponse.json(
      {
        sucesso: false,
        erro: {
          codigo: "LEITOR_EM_PUNICAO",
          mensagem: "Leitor em punição por atraso. Regularize a devolução antes de pegar outro empréstimo.",
        },
      },
      { status: 403 }
    );
  }
  return null;
}

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

    // 2.1 Bloquear leitores em punição/banidos por atraso
    const bloqueio = await bloqueioPorPunicao(idLeitor);
    if (bloqueio) return bloqueio;

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
 * GET /api/emprestimos/:id
 *
 * Busca um empréstimo específico por ID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const emprestimoService = new EmprestimoService();

    if (!id) {
      // Reavalia atrasos/punições antes de listar (não há agendador).
      await new PunicaoService().avaliarTodos();
      const limite = parseInt(searchParams.get("limite") ?? "10", 10);
      const emprestimos = await emprestimoService.listarRecentes(limite);
      return NextResponse.json({ sucesso: true, dados: emprestimos }, { status: 200 });
    }

    const emprestimo = await emprestimoService.obterEmprestimoPorId(id);

    return NextResponse.json(
      {
        sucesso: true,
        dados: emprestimo,
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

    console.error("Erro ao buscar empréstimo:", erro);
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
