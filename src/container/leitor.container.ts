import {LeitorRepository} from "@/repositories/leitorRepository.ts";
import {LeitorService} from "@/services/leitorService.ts";

const repository = new LeitorRepository();
export const leitorService = new LeitorService(repository);