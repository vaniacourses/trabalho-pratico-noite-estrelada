import {BibliotecaFacade} from "@/services/bibliotecaFacade.ts";

// Fachada única do fluxo de empréstimos consumida pelas rotas da API.
export const bibliotecaFacade = new BibliotecaFacade();
