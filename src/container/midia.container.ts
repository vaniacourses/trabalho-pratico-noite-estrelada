import {MidiaRespository} from "@/repositories/midiaRepository.ts";
import {MidiaService} from "@/services/midiaService.ts";

const repository = new MidiaRespository();
export const midiaService = new MidiaService(repository);