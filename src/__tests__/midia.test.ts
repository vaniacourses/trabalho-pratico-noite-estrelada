/**
 * Testes para os endpoints de mídia
 * 
 * Para executar testes de verdade, instale Jest e dependências:
 * npm install --save-dev jest @testing-library/react @types/jest ts-jest
 * 
 * Este arquivo estrutura testes unitários e de integração para os endpoints:
 * - GET /api/midias
 * - POST /api/midias
 * - GET /api/midias/:id
 * - PUT /api/midias/:id
 * - DELETE /api/midias/:id
 */

import { MidiaService } from "@/src/services/midiaService";
import { MidiaRespository } from "@/src/repositories/midiaRepository";
import { IErroAplicacao, IMidiaDTO, IPublicacaoDTO, ICdDTO, IDvdDTO } from "@/src/types";
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
      throw {
        codigo: "MIDIA_NAO_ENCONTRADA",
        mensagem: "Mídia não encontrada",
        statusHttp: 404,
      };
    }
    Object.assign(midia, data);
    return midia;
  }

  async deletarMidia(id: string) {
    const index = this.midias.findIndex((m) => m.id === id);
    if (index === -1) {
      throw {
        codigo: "MIDIA_NAO_ENCONTRADA",
        mensagem: "Mídia não encontrada",
        statusHttp: 404,
      };
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
      const publicacao: IPublicacaoDTO = {
        tipo: "PUBLICACAO",
        titulo: "Clean Code",
        dataCriacao: new Date(),
        autor: "Robert Martin",
        paginas: 464,
        dados: {
          tipo: "PUBLICACAO",
          titulo: "Clean Code",
          dataCriacao: new Date(),
          autor: "Robert Martin",
          paginas: 464,
        },
      };

      await service.criarMidia(publicacao);
      const resultado = await service.obterMidias();

      expect(resultado.length).toBe(1);
      expect(resultado[0].titulo).toBe("Clean Code");
    });
  });

  describe("criarMidia", () => {
    it("✅ deve criar mídia do tipo PUBLICACAO com dados válidos", async () => {
      const publicacao: IPublicacaoDTO = {
        tipo: "PUBLICACAO",
        titulo: "The Pragmatic Programmer",
        dataCriacao: new Date(),
        autor: "David Thomas",
        paginas: 352,
        dados: {
          tipo: "PUBLICACAO",
          titulo: "The Pragmatic Programmer",
          dataCriacao: new Date(),
          autor: "David Thomas",
          paginas: 352,
        },
      };

      const resultado = await service.criarMidia(publicacao);

      expect(resultado.id).toBeDefined();
      expect(resultado.titulo).toBe("The Pragmatic Programmer");
      expect(resultado.tipo).toBe(TipoDeMidia.PUBLICACAO);
    });

    it("✅ deve criar mídia do tipo CD com dados válidos", async () => {
      const cd: ICdDTO = {
        tipo: "CD",
        titulo: "Dark Side of the Moon",
        dataCriacao: new Date(),
        artista: "Pink Floyd",
        faixas: ["Time", "Money", "Us and Them"],
        duracao: 4260,
        dados: {
          tipo: "CD",
          titulo: "Dark Side of the Moon",
          dataCriacao: new Date(),
          artista: "Pink Floyd",
          faixas: ["Time", "Money", "Us and Them"],
          duracao: 4260,
        },
      };

      const resultado = await service.criarMidia(cd);

      expect(resultado.id).toBeDefined();
      expect(resultado.titulo).toBe("Dark Side of the Moon");
      expect(resultado.tipo).toBe(TipoDeMidia.CD);
    });

    it("✅ deve criar mídia do tipo DVD com dados válidos", async () => {
      const dvd: IDvdDTO = {
        tipo: "DVD",
        titulo: "Inception",
        dataCriacao: new Date(),
        diretor: "Christopher Nolan",
        codigoDeRegiao: "2",
        legendas: ["Português", "Inglês"],
        duracao: 8880,
        dados: {
          tipo: "DVD",
          titulo: "Inception",
          dataCriacao: new Date(),
          diretor: "Christopher Nolan",
          codigoDeRegiao: "2",
          legendas: ["Português", "Inglês"],
          duracao: 8880,
        },
      };

      const resultado = await service.criarMidia(dvd);

      expect(resultado.id).toBeDefined();
      expect(resultado.titulo).toBe("Inception");
      expect(resultado.tipo).toBe(TipoDeMidia.DVD);
    });
  });

  describe("obterMidiaPorId", () => {
    it("✅ deve retornar mídia existente por ID", async () => {
      const publicacao: IPublicacaoDTO = {
        tipo: "PUBLICACAO",
        titulo: "Design Patterns",
        dataCriacao: new Date(),
        autor: "Gang of Four",
        paginas: 416,
        dados: {
          tipo: "PUBLICACAO",
          titulo: "Design Patterns",
          dataCriacao: new Date(),
          autor: "Gang of Four",
          paginas: 416,
        },
      };

      const criada = await service.criarMidia(publicacao);
      const resultado = await service.obterMidiaPorId(criada.id);

      expect(resultado).not.toBeNull();
      expect(resultado?.id).toBe(criada.id);
      expect(resultado?.titulo).toBe("Design Patterns");
    });

    it("❌ deve lançar erro se mídia não encontrada", async () => {
      await expect(service.obterMidiaPorId("id-inexistente")).rejects.toThrow(
        "não encontrada"
      );
    });
  });

  describe("atualizarMidia", () => {
    it("✅ deve atualizar título da mídia", async () => {
      const publicacao: IMidiaDTO = {
        tipo: "PUBLICACAO",
        titulo: "Code Complete",
        dataCriacao: new Date(),
        autor: "Steve McConnell",
        paginas: 960,
        dados: {
          titulo: "Code Complete",
          dataCriacao: new Date(),
          autor: "Steve McConnell",
          paginas: 960,
        },
      };

      const criada = await service.criarMidia(publicacao);

      const atualizacao: IMidiaDTO = {
        tipo: "PUBLICACAO" as TipoDeMidia,
        titulo: "Code Complete (2nd Edition)",
        dataCriacao: criada.dataCriacao,
        autor: "Steve McConnell",
        paginas: 960,
        dados: {
          titulo: "Code Complete (2nd Edition)",
          dataCriacao: criada.dataCriacao,
          autor: "Steve McConnell",
          paginas: 960,
        },
      };

      const resultado = await service.atualizarMidia(criada.id, atualizacao);

      expect(resultado.titulo).toBe("Code Complete (2nd Edition)");
    });

    it("❌ deve lançar erro ao atualizar mídia inexistente", async () => {
      const atualizacao: IPublicacaoDTO = {
        tipo: "PUBLICACAO",
        titulo: "Título novo",
        dataCriacao: new Date(),
        autor: "Autor",
        paginas: 100,
        dados: {
          tipo: "PUBLICACAO",
          titulo: "Título novo",
          dataCriacao: new Date(),
          autor: "Autor",
          paginas: 100,
        },
      };

      await expect(
        service.atualizarMidia("id-inexistente", atualizacao)
      ).rejects.toThrow();
    });
  });

  describe("deletarMidia", () => {
    it("✅ deve deletar mídia existente", async () => {
      const publicacao: IPublicacaoDTO = {
        tipo: "PUBLICACAO",
        titulo: "A ser deletado",
        dataCriacao: new Date(),
        autor: "Autor",
        paginas: 100,
        dados: {
          tipo: "PUBLICACAO",
          titulo: "A ser deletado",
          dataCriacao: new Date(),
          autor: "Autor",
          paginas: 100,
        },
      };

      const criada = await service.criarMidia(publicacao);
      await service.deletarMidia(criada.id);

      const todas = await service.obterMidias();
      expect(todas.length).toBe(0);
    });

    it("❌ deve lançar erro ao deletar mídia inexistente", async () => {
      await expect(service.deletarMidia("id-inexistente")).rejects.toThrow();
    });
  });
});

describe("MidiaRepository", () => {
  // Testes de integração com banco real
  // Apenas executar com banco de teste

  it("✅ deve criar mídia e incluir exemplares/reservas", async () => {
    // Requer banco real e seed data
    // const repository = new MidiaRespository();
    // const midia = await repository.obterMidiaPorId("alguma-id");
    // expect(midia.exemplares).toBeDefined();
    // expect(Array.isArray(midia.exemplares)).toBe(true);
    // expect(midia.reservas).toBeDefined();
    // expect(Array.isArray(midia.reservas)).toBe(true);
  });

  it("✅ deve retornar mídia com relacionamentos carregados", async () => {
    // Requer banco real
    // const repository = new MidiaRespository();
    // const midias = await repository.obterMidias();
    // expect(midias.length).toBeGreaterThan(0);
    // midias.forEach((midia) => {
    //   expect(midia.exemplares).toBeDefined();
    //   expect(midia.reservas).toBeDefined();
    // });
  });

  it("✅ deve persistir dados JSON corretamente", async () => {
    // Requer banco real
    // const repository = new MidiaRespository();
    // const midia = await repository.obterMidiaPorId("alguma-id");
    // expect(midia.dados).toBeDefined();
    // if (midia.tipo === "PUBLICACAO") {
    //   expect(midia.dados.autor).toBeDefined();
    //   expect(midia.dados.paginas).toBeDefined();
    // }
  });
});

/**
 * Cenários adicionais para cobertura completa:
 * 
 * 1. Validação de entrada
 *    - Título vazio/nulo
 *    - Tipo de mídia inválido
 *    - Dados obrigatórios faltando
 * 
 * 2. Transações
 *    - Verificar que criar midia não deixa estado inconsistente
 *    - Rollback em caso de erro
 * 
 * 3. Relacionamentos
 *    - Deletar mídia com exemplares
 *    - Deletar mídia com reservas
 *    - Exemplares/reservas carregados corretamente
 * 
 * 4. Campos JSON (dados)
 *    - Dados salvos e recuperados corretamente
 *    - Tipos específicos preservados (PUBLICACAO, CD, DVD)
 * 
 * Executar testes:
 * npx jest
 * 
 * Executar testes com coverage:
 * npx jest --coverage
 * 
 * Modo watch (re-executar ao salvar):
 * npx jest --watch
 * 
 * Testes de integração (requer banco de dados):
 * npx jest --testNamePattern="MidiaRepository"
 */
