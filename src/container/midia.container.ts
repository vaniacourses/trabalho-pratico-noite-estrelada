import {MidiaRespository} from "@/src/repositories/midiaRepository.ts";
import {MidiaService} from "@/src/services/midiaService.ts";

const repository = new MidiaRespository();
export const midiaService = new MidiaService(repository);