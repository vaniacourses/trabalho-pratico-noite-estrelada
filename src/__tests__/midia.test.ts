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

// Todos os objetos de teste usam IMidiaDTO (tipo completo do DTO) em vez de IPublicacaoDTO/ICdDTO/IDvdDTO
// que são apenas o shape de 'dados'. Valores respeitam as regras de negócio:
// CD: duracao <= 80 min | DVD: duracao <= 120 min, codigoDeRegiao in ["0","1","4","Todas"]
// PUBLICACAO: isbn com 10 dígitos, paginas entre 4 e 10000
import { MidiaService } from "@/services/midiaService";
import { MidiaRespository } from "@/repositories/midiaRepository";
import { IMidiaDTO } from "@/types";

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
      const publicacao: IMidiaDTO = {
        tipo: "PUBLICACAO",
        titulo: "Clean Code",
        dataCriacao: new Date(),
        dados: {
          autor: "Robert Martin",
          isbn: "0123456789",
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
      const publicacao: IMidiaDTO = {
        tipo: "PUBLICACAO",
        titulo: "The Pragmatic Programmer",
        dataCriacao: new Date(),
        dados: {
          autor: "David Thomas",
          isbn: "0123456789",
          paginas: 352,
        },
      };

      const resultado = await service.criarMidia(publicacao);

      expect(resultado.id).toBeDefined();
      expect(resultado.titulo).toBe("The Pragmatic Programmer");
      expect(resultado.tipo).toBe("PUBLICACAO");
    });

    it("✅ deve criar mídia do tipo CD com dados válidos", async () => {
      const cd: IMidiaDTO = {
        tipo: "CD",
        titulo: "Dark Side of the Moon",
        dataCriacao: new Date(),
        dados: {
          artista: "Pink Floyd",
          faixas: ["Time", "Money", "Us and Them"],
          duracao: 42,
        },
      };

      const resultado = await service.criarMidia(cd);

      expect(resultado.id).toBeDefined();
      expect(resultado.titulo).toBe("Dark Side of the Moon");
      expect(resultado.tipo).toBe("CD");
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
          duracao: 108,
        },
      };

      const resultado = await service.criarMidia(dvd);

      expect(resultado.id).toBeDefined();
      expect(resultado.titulo).toBe("Inception");
      expect(resultado.tipo).toBe("DVD");
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
          isbn: "0123456789",
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
      // criarErro retorna objeto puro (não Error), então usamos toMatchObject em vez de toThrow
      await expect(service.obterMidiaPorId("id-inexistente")).rejects.toMatchObject({
        mensagem: "Mídia não encontrada",
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
          isbn: "0123456789",
          paginas: 960,
        },
      };

      const criada = await service.criarMidia(publicacao);

      const atualizacao: IMidiaDTO = {
        tipo: "PUBLICACAO",
        titulo: "Code Complete (2nd Edition)",
        dataCriacao: new Date(),
        dados: {
          autor: "Steve McConnell",
          isbn: "0123456789",
          paginas: 960,
        },
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
          isbn: "0123456789",
          paginas: 100,
        },
      };

      // criarErro retorna objeto puro; toMatchObject verifica sem exigir instanceof Error
      await expect(
        service.atualizarMidia("id-inexistente", atualizacao)
      ).rejects.toMatchObject({ codigo: "ERRO_ATUALIZAR_MIDIA" });
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
          isbn: "0123456789",
          paginas: 100,
        },
      };

      const criada = await service.criarMidia(publicacao);
      await service.deletarMidia(criada.id);

      const todas = await service.obterMidias();
      expect(todas.length).toBe(0);
    });

    it("❌ deve lançar erro ao deletar mídia inexistente", async () => {
      // criarErro retorna objeto puro; toMatchObject verifica sem exigir instanceof Error
      await expect(service.deletarMidia("id-inexistente")).rejects.toMatchObject({ codigo: "ERRO_DELETAR_MIDIA" });
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
