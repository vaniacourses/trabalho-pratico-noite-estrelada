import {EmprestimoService} from "@/services/emprestimoService";
import {PunicaoService} from "@/services/punicaoService";
import {ExemplarService} from "@/services/exemplarService";
import {NotificarLeitoresServiceComObserver} from "@/services/notificarLeitoresServiceComObserver";
import {estadoDoLeitor} from "@/domain/leitor/state/LeitorState";
import type {IEmprestimoResponse, IErroAplicacao, IRealizarEmprestimoDTO} from "@/types";

/**
 * Facade (GoF - Estrutural)
 *
 * Oferece uma interface única e simples para o fluxo de empréstimos, escondendo
 * das rotas a coordenação entre vários subsistemas:
 *   - PunicaoService  (reavalia atrasos)
 *   - LeitorState     (decide bloqueio por estado)
 *   - EmprestimoService (regras de negócio do empréstimo)
 *   - ExemplarService + NotificarLeitoresServiceComObserver (Observer ao devolver)
 *
 * Antes, cada rota orquestrava esses passos manualmente; agora basta chamar a
 * fachada.
 */
export class BibliotecaFacade {
    constructor(
        private emprestimoService: EmprestimoService = new EmprestimoService(),
        private punicaoService: PunicaoService = new PunicaoService(),
        private exemplarService: ExemplarService = new ExemplarService(),
    ) {
    }

    /**
     * Solicita um empréstimo: reavalia a punição do leitor, aplica a regra de
     * bloqueio do estado (padrão State) e delega a criação ao serviço.
     */
    async solicitarEmprestimo(dto: IRealizarEmprestimoDTO): Promise<IEmprestimoResponse> {
        const estado = await this.punicaoService.avaliarLeitor(dto.idLeitor);

        if (estado) {
            const leitorState = estadoDoLeitor(estado);
            if (!leitorState.podeSolicitarEmprestimo()) {
                throw this.criarErro(
                    estado === "BANIDO" ? "LEITOR_BANIDO" : "LEITOR_EM_PUNICAO",
                    leitorState.mensagemBloqueio() ?? "Empréstimo não permitido para este leitor.",
                    403
                );
            }
        }

        return this.emprestimoService.solicitarEmprestimo(dto);
    }

    aprovarEmprestimo(id: string): Promise<IEmprestimoResponse> {
        return this.emprestimoService.aprovarEmprestimo(id);
    }

    rejeitarEmprestimo(id: string): Promise<IEmprestimoResponse> {
        return this.emprestimoService.rejeitarEmprestimo(id);
    }

    /**
     * Finaliza (devolve) um empréstimo e, em seguida, aciona o Observer para
     * notificar os leitores na lista de espera do exemplar liberado.
     */
    async finalizarEmprestimo(id: string): Promise<IEmprestimoResponse> {
        const resultado = await this.emprestimoService.finalizarEmprestimo(id);

        // A notificação é um efeito colateral: uma falha aqui não invalida a devolução.
        try {
            const exemplar = await this.exemplarService.obterExemplarPorId(resultado.idExemplar);
            await new NotificarLeitoresServiceComObserver().notificarLeitores(exemplar);
        } catch (erro) {
            console.error("Falha ao notificar leitores em espera:", erro);
        }

        return resultado;
    }

    listarPendentes() {
        return this.emprestimoService.listarPendentes();
    }

    listarRecentes(limite?: number) {
        return this.emprestimoService.listarRecentes(limite);
    }

    private criarErro(codigo: string, mensagem: string, statusHttp: number): IErroAplicacao {
        return {codigo, mensagem, statusHttp};
    }
}
