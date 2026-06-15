import {NotificarLeitoresServiceComObserver} from "@/services/notificarLeitoresServiceComObserver.ts";

// Instância única do Subject (padrão Observer) usada pelo fluxo de devolução.
export const notificarLeitoresService = new NotificarLeitoresServiceComObserver();
