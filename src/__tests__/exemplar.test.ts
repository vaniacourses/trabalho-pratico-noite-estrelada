import { ExemplarService } from "@/services/exemplarService";
import { ExemplarRepository } from "@/repositories/exemplarRepository";
import { EstadoExemplar } from "@prisma/client";
import { IExemplarDTO } from "@/types";

// Mock do repositório para testes (armazenamento em memória)
class MockExemplarRepository extends ExemplarRepository {
  private exemplares: any[] = [];
  private mockIdCounter = 0;

  async criarExemplar(data: IExemplarDTO) {
    const novo = {
      id: `exemplar-${++this.mockIdCounter}`,
      idMidia: data.idMidia,
      codigo: data.codigo,
      estado: "DISPONIVEL" as EstadoExemplar,
      dataCriacao: new Date(),
      dataAtualizacao: new Date(),
    };
    this.exemplares.push(novo);
    return novo;
  }

  async obterExemplaresPorMidia(idMidia: string) {
    return this.exemplares.filter((e) => e.idMidia === idMidia);
  }

  async obterExemplarPorCodigo(codigo: string) {
    return this.exemplares.find((e) => e.codigo === codigo) || null;
  }

  async obterExemplarPorId(id: string) {
    return this.exemplares.find((e) => e.id === id) || null;
  }

  async atualizarExemplar(id: string, data: { codigo?: string; estado?: EstadoExemplar }) {
    const exemplar = this.exemplares.find((e) => e.id === id);
    if (!exemplar) {
      throw new Error("Exemplar não encontrado");
    }
    Object.assign(exemplar, data, { dataAtualizacao: new Date() });
    return exemplar;
  }

  async deletarExemplar(id: string) {
    const index = this.exemplares.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new Error("Exemplar não encontrado");
    }
    const [removido] = this.exemplares.splice(index, 1);
    return removido;
  }
}

function dto(overrides: Partial<IExemplarDTO> = {}): IExemplarDTO {
  return {
    idMidia: "midia-1",
    codigo: "EX-0001",
    tipo: "DISPONIVEL" as EstadoExemplar,
    ...overrides,
  };
}

describe("ExemplarService", () => {
  let service: ExemplarService;
  let mockRepository: MockExemplarRepository;

  beforeEach(() => {
    mockRepository = new MockExemplarRepository();
    service = new ExemplarService(mockRepository);
  });

  describe("criarExemplar", () => {
    it("✅ deve criar exemplar com código válido", async () => {
      const resultado = await service.criarExemplar(dto({ codigo: "EX-0001" }));

      expect(resultado.id).toBeDefined();
      expect(resultado.codigo).toBe("EX-0001");
      expect(resultado.estado).toBe("DISPONIVEL");
    });

    it("✅ deve remover espaços em branco do código (trim)", async () => {
      const resultado = await service.criarExemplar(dto({ codigo: "  EX-0002  " }));
      expect(resultado.codigo).toBe("EX-0002");
    });

    it("❌ deve lançar erro se o código estiver vazio", async () => {
      await expect(service.criarExemplar(dto({ codigo: "" }))).rejects.toMatchObject({
        codigo: "VALIDACAO_ERRO",
        erros: { codigo: expect.stringContaining("obrigatório") },
      });
    });

    it("❌ deve lançar erro se o código tiver menos de 3 caracteres", async () => {
      await expect(service.criarExemplar(dto({ codigo: "AB" }))).rejects.toMatchObject({
        codigo: "VALIDACAO_ERRO",
        erros: { codigo: expect.stringContaining("mínimo 3") },
      });
    });

    it("❌ deve lançar erro se o código já existir", async () => {
      await service.criarExemplar(dto({ codigo: "EX-0001" }));

      await expect(service.criarExemplar(dto({ codigo: "EX-0001" }))).rejects.toMatchObject({
        codigo: "VALIDACAO_ERRO",
        erros: { codigo: expect.stringContaining("já existe") },
      });
    });
  });

  describe("obterExemplaresPorMidia", () => {
    it("✅ deve retornar apenas os exemplares da mídia informada", async () => {
      await service.criarExemplar(dto({ idMidia: "midia-1", codigo: "EX-0001" }));
      await service.criarExemplar(dto({ idMidia: "midia-1", codigo: "EX-0002" }));
      await service.criarExemplar(dto({ idMidia: "midia-2", codigo: "EX-0003" }));

      const resultado = await service.obterExemplaresPorMidia("midia-1");

      expect(resultado.length).toBe(2);
      expect(resultado.every((e) => e.idMidia === "midia-1")).toBe(true);
    });

    it("✅ deve retornar lista vazia se a mídia não tiver exemplares", async () => {
      const resultado = await service.obterExemplaresPorMidia("midia-inexistente");
      expect(resultado).toEqual([]);
    });
  });

  describe("obterExemplarPorId", () => {
    it("✅ deve retornar o exemplar existente por ID", async () => {
      const criado = await service.criarExemplar(dto({ codigo: "EX-0001" }));
      const resultado = await service.obterExemplarPorId(criado.id);

      expect(resultado.id).toBe(criado.id);
      expect(resultado.codigo).toBe("EX-0001");
    });

    it("❌ deve lançar erro 404 se o exemplar não for encontrado", async () => {
      await expect(service.obterExemplarPorId("id-inexistente")).rejects.toMatchObject({
        codigo: "EXEMPLAR_NAO_ENCONTRADO",
        statusHttp: 404,
      });
    });
  });

  describe("atualizarExemplar", () => {
    it("✅ deve atualizar o código do exemplar", async () => {
      const criado = await service.criarExemplar(dto({ codigo: "EX-0001" }));
      const resultado = await service.atualizarExemplar(criado.id, { codigo: "EX-9999" });

      expect(resultado.codigo).toBe("EX-9999");
    });

    it("✅ deve atualizar o estado do exemplar", async () => {
      const criado = await service.criarExemplar(dto({ codigo: "EX-0001" }));
      const resultado = await service.atualizarExemplar(criado.id, { estado: "AFASTADO" });

      expect(resultado.estado).toBe("AFASTADO");
    });

    it("✅ deve permitir salvar mantendo o mesmo código (sem conflito consigo mesmo)", async () => {
      const criado = await service.criarExemplar(dto({ codigo: "EX-0001" }));
      const resultado = await service.atualizarExemplar(criado.id, {
        codigo: "EX-0001",
        estado: "RESERVADO",
      });

      expect(resultado.codigo).toBe("EX-0001");
      expect(resultado.estado).toBe("RESERVADO");
    });

    it("❌ deve lançar erro 404 se o exemplar não existir", async () => {
      await expect(
        service.atualizarExemplar("id-inexistente", { codigo: "EX-0001" })
      ).rejects.toMatchObject({
        codigo: "EXEMPLAR_NAO_ENCONTRADO",
        statusHttp: 404,
      });
    });

    it("❌ deve lançar erro se o novo código tiver menos de 3 caracteres", async () => {
      const criado = await service.criarExemplar(dto({ codigo: "EX-0001" }));

      await expect(
        service.atualizarExemplar(criado.id, { codigo: "AB" })
      ).rejects.toMatchObject({
        codigo: "VALIDACAO_ERRO",
        erros: { codigo: expect.stringContaining("mínimo 3") },
      });
    });

    it("❌ deve lançar erro se o novo código já pertencer a outro exemplar", async () => {
      await service.criarExemplar(dto({ codigo: "EX-0001" }));
      const segundo = await service.criarExemplar(dto({ codigo: "EX-0002" }));

      await expect(
        service.atualizarExemplar(segundo.id, { codigo: "EX-0001" })
      ).rejects.toMatchObject({
        codigo: "VALIDACAO_ERRO",
        erros: { codigo: expect.stringContaining("já existe") },
      });
    });
  });

  describe("deletarExemplar", () => {
    it("✅ deve deletar um exemplar existente", async () => {
      const criado = await service.criarExemplar(dto({ codigo: "EX-0001" }));
      await service.deletarExemplar(criado.id);

      const restantes = await service.obterExemplaresPorMidia("midia-1");
      expect(restantes.length).toBe(0);
    });

    it("❌ deve lançar erro ao deletar exemplar inexistente", async () => {
      await expect(service.deletarExemplar("id-inexistente")).rejects.toMatchObject({
        codigo: expect.any(String),
      });
    });
  });
});
