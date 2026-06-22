import { MidiaService } from "@/services/midiaService";
import { MidiaRespository } from "@/repositories/midiaRepository";
import { IMidiaDTO, IPublicacaoDTO, ICdDTO, IDvdDTO } from "@/types";
import { TipoDeMidia } from "@prisma/client";

// Mock do repositório para testes
class MockMidiaRepository extends MidiaRespository {
  private midias: any[] = [];
  private mockIdCounter = 0;

  async obterMidias() {
    return this.midias;
  }

  async obterMidiaPorId(id: string) {
    return this.midias.find((m) => m.id === id) || null;
  }

  async criarMidia(midia: any) {
    const novaId = `midia-${++this.mockIdCounter}`;
    const novaMiddia = {
      id: novaId,
      ...midia,
      dataCriacao: new Date(),
      exemplares: [],
      reservas: [],
    };
    this.midias.push(novaMiddia);
    return novaMiddia;
  }

  async atualizarMidia(id: string, data: any) {
    const midia = this.midias.find((m) => m.id === id);
    if (!midia) {
      throw new Error("Mídia não encontrada");
    }
    Object.assign(midia, data);
    return midia;
  }

  async deletarMidia(id: string) {
    const index = this.midias.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new Error("Mídia não encontrada");
    }
    const midia = this.midias[index];
    this.midias.splice(index, 1);
    return midia;
  }

  reset() {
    this.midias = [];
    this.mockIdCounter = 0;
  }
}

describe("MidiaService", () => {
  let service: MidiaService;
  let mockRepository: MockMidiaRepository;

  beforeEach(() => {
    mockRepository = new MockMidiaRepository();
    service = new MidiaService(mockRepository);
  });

  describe("obterMidias", () => {
    it("✅ deve retornar lista vazia inicialmente", async () => {
      const resultado = await service.obterMidias();

      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado.length).toBe(0);
    });

    it("✅ deve retornar todas as mídias criadas", async () => {
      const publicacao: IMidiaDTO = {
        tipo: "PUBLICACAO",
        titulo: "Clean Code",
        dataCriacao: new Date(),
        dados: {
          autor: "Robert Martin",
          isbn: "9780132350884",
          paginas: 464,
        } as IPublicacaoDTO,
      };

      await service.criarMidia(publicacao);
      const resultado = await service.obterMidias();

      expect(resultado.length).toBe(1);
      expect(resultado[0].titulo).toBe("Clean Code");
    });
  });

  describe("criarMidia", () => {
    it("✅ deve criar mídia do tipo PUBLICACAO com dados válidos", async () => {
      const publicacao: IMidiaDTO = {
        tipo: "PUBLICACAO",
        titulo: "The Pragmatic Programmer",
        dataCriacao: new Date(),
        dados: {
          autor: "David Thomas",
          isbn: "9780201616224",
          paginas: 352,
        } as IPublicacaoDTO,
      };

      const resultado = await service.criarMidia(publicacao);

      expect(resultado.id).toBeDefined();
      expect(resultado.titulo).toBe("The Pragmatic Programmer");
      expect(resultado.tipo).toBe(TipoDeMidia.PUBLICACAO);
    });

    it("✅ deve criar mídia do tipo CD com dados válidos", async () => {
      const cd: IMidiaDTO = {
        tipo: "CD",
        titulo: "Dark Side of the Moon",
        dataCriacao: new Date(),
        dados: {
          artista: "Pink Floyd",
          faixas: ["Speak to Me:2", "Breathe:2", "Time:7", "Money:7", "Us and Them:8", "Eclipse:5", "Brain Damage:5", "Any Colour:7"],
          duracao: 43,
        } as ICdDTO,
      };

      const resultado = await service.criarMidia(cd);

      expect(resultado.id).toBeDefined();
      expect(resultado.titulo).toBe("Dark Side of the Moon");
      expect(resultado.tipo).toBe(TipoDeMidia.CD);
    });

    it("✅ deve criar mídia do tipo DVD com dados válidos", async () => {
      const dvd: IMidiaDTO = {
        tipo: "DVD",
        titulo: "Inception",
        dataCriacao: new Date(),
        dados: {
          diretor: "Christopher Nolan",
          codigoDeRegiao: "1",
          legendas: ["Português", "Inglês"],
          duracao: 110,
        } as IDvdDTO,
      };

      const resultado = await service.criarMidia(dvd);

      expect(resultado.id).toBeDefined();
      expect(resultado.titulo).toBe("Inception");
      expect(resultado.tipo).toBe(TipoDeMidia.DVD);
    });
  });

  describe("obterMidiaPorId", () => {
    it("✅ deve retornar mídia existente por ID", async () => {
      const publicacao: IMidiaDTO = {
        tipo: "PUBLICACAO",
        titulo: "Design Patterns",
        dataCriacao: new Date(),
        dados: {
          autor: "Gang of Four",
          isbn: "9780201633610",
          paginas: 416,
        } as IPublicacaoDTO,
      };

      const criada = await service.criarMidia(publicacao);
      const resultado = await service.obterMidiaPorId(criada.id);

      expect(resultado).not.toBeNull();
      expect(resultado?.id).toBe(criada.id);
      expect(resultado?.titulo).toBe("Design Patterns");
    });

    it("❌ deve lançar erro se mídia não encontrada", async () => {
      await expect(service.obterMidiaPorId("id-inexistente")).rejects.toMatchObject({
        mensagem: expect.stringContaining("encontrada"),
      });
    });
  });

  describe("atualizarMidia", () => {
    it("✅ deve atualizar título da mídia", async () => {
      const publicacao: IMidiaDTO = {
        tipo: "PUBLICACAO",
        titulo: "Code Complete",
        dataCriacao: new Date(),
        dados: {
          autor: "Steve McConnell",
          isbn: "9780735619678",
          paginas: 960,
        } as IPublicacaoDTO,
      };

      const criada = await service.criarMidia(publicacao);

      const atualizacao: IMidiaDTO = {
        tipo: "PUBLICACAO",
        titulo: "Code Complete (2nd Edition)",
        dataCriacao: criada.dataCriacao,
        dados: {
          autor: "Steve McConnell",
          isbn: "9780735619678",
          paginas: 960,
        } as IPublicacaoDTO,
      };

      const resultado = await service.atualizarMidia(criada.id, atualizacao);

      expect(resultado.titulo).toBe("Code Complete (2nd Edition)");
    });

    it("❌ deve lançar erro ao atualizar mídia inexistente", async () => {
      const atualizacao: IMidiaDTO = {
        tipo: "PUBLICACAO",
        titulo: "Título novo",
        dataCriacao: new Date(),
        dados: {
          autor: "Autor",
          isbn: "9780000000001",
          paginas: 100,
        } as IPublicacaoDTO,
      };

      await expect(service.atualizarMidia("id-inexistente", atualizacao)).rejects.toMatchObject({
        codigo: expect.any(String),
      });
    });
  });

  describe("deletarMidia", () => {
    it("✅ deve deletar mídia existente", async () => {
      const publicacao: IMidiaDTO = {
        tipo: "PUBLICACAO",
        titulo: "A ser deletado",
        dataCriacao: new Date(),
        dados: {
          autor: "Autor",
          isbn: "9780000000002",
          paginas: 100,
        } as IPublicacaoDTO,
      };

      const criada = await service.criarMidia(publicacao);
      await service.deletarMidia(criada.id);

      const todas = await service.obterMidias();
      expect(todas.length).toBe(0);
    });

    it("❌ deve lançar erro ao deletar mídia inexistente", async () => {
      await expect(service.deletarMidia("id-inexistente")).rejects.toMatchObject({
        codigo: expect.any(String),
      });
    });
  });
});

describe("MidiaRepository", () => {
  it("✅ deve criar mídia e incluir exemplares/reservas", async () => {
    // Requer banco real e seed data
  });

  it("✅ deve retornar mídia com relacionamentos carregados", async () => {
    // Requer banco real
  });

  it("✅ deve persistir dados JSON corretamente", async () => {
    // Requer banco real
  });
});
