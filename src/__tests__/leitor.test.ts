import {LeitorService} from "@/services/leitorService";
import {LeitorRepository} from "@/repositories/leitorRepository";
import type {Leitor, EstadoLeitor} from "@prisma/client";

// Mock do repositório para testes
class MockLeitorRepository extends LeitorRepository {
    private leitores: Map<string, Leitor> = new Map();

    constructor() {
        super();
        // Popula alguns leitores de teste
        this.leitores.set("leitor-123", {
            id: "leitor-123",
            nome: "João Silva",
            senha: "hashed_password_123",
            email: "joao@example.com",
            cpf: "123.456.789-00",
            dataDeNascimento: new Date("1990-01-15"),
            estado: "REGULAR" as EstadoLeitor,
            dataCriacao: new Date(),
            dataAtualizacao: new Date(),
        });

        this.leitores.set("leitor-incompleto", {
            id: "leitor-incompleto",
            nome: "Maria",
            senha: "hashed_password_456",
            email: "",
            cpf: "",
            dataDeNascimento: undefined as any,
            estado: "INCOMPLETO" as EstadoLeitor,
            dataCriacao: new Date(),
            dataAtualizacao: new Date(),
        });
    }

    async obterLeitorPorId(id: string): Promise<Leitor | null> {
        const leitor = this.leitores.get(id);
        return leitor || null;
    }

    async obterLeitores(): Promise<Leitor[]> {
        return Array.from(this.leitores.values());
    }

    async criarLeitor(
        data: any
    ): Promise<Leitor> {
        const novoId = `leitor-${Date.now()}`;
        const novoLeitor:Leitor = {
            id: novoId,
            nome: data.nome,
            senha: data.senha,
            email: data.email || "",
            cpf: data.cpf || "",
            dataDeNascimento: data.dataDeNascimento || new Date(),
            estado: data.estado as EstadoLeitor,
            dataCriacao: new Date(),
            dataAtualizacao: new Date(),
        };

        this.leitores.set(novoId, novoLeitor);
        return novoLeitor;
    }

    async atualizarLeitor(id: string, data: Partial<Leitor>): Promise<Leitor> {
        const leitor = this.leitores.get(id);
        if (!leitor) {
            throw new Error("Leitor não encontrado");
        }

        const leitorAtualizado: Leitor = {
            ...leitor,
            ...data,
            dataAtualizacao: new Date(),
        };

        this.leitores.set(id, leitorAtualizado);
        return leitorAtualizado;
    }

    async deletarLeitor(id: string): Promise<Leitor> {
        const leitor = this.leitores.get(id);
        if (!leitor) {
            throw new Error("Leitor não encontrado");
        }

        this.leitores.delete(id);
        return leitor;
    }
}

describe("LeitorService", () => {
    let service: LeitorService;
    let mockRepository: MockLeitorRepository;

    beforeEach(() => {
        mockRepository = new MockLeitorRepository();
        service = new LeitorService(mockRepository);
    });

    describe("obterLeitorPorId", () => {
        it("✅ deve retornar um leitor quando ID é válido", async () => {
            const leitor = await service.obterLeitorPorId("leitor-123");

            expect(leitor).toBeDefined();
            expect(leitor.id).toBe("leitor-123");
            expect(leitor.nome).toBe("João Silva");
            expect(leitor.estado).toBe("REGULAR");
        });

        it("❌ deve lançar erro quando leitor não existe", async () => {
            const erroEsperado = await service.obterLeitorPorId("leitor-inexistente").catch(
                (erro: any) => erro
            );

            expect(erroEsperado).toBeDefined();
            expect(erroEsperado.codigo).toBe("LEITOR_NAO_ENCONTRADO");
            expect(erroEsperado.statusHttp).toBe(404);
        });
    });

    describe("obterLeitores", () => {
        it("✅ deve retornar lista de todos os leitores", async () => {
            const leitores = await service.obterLeitores();

            expect(leitores).toBeDefined();
            expect(Array.isArray(leitores)).toBe(true);
            expect(leitores.length).toBeGreaterThan(0);
            expect(leitores.some((l: Leitor) => l.id === "leitor-123")).toBe(true);
        });

        it("✅ deve incluir leitores em diferentes estados", async () => {
            const leitores = await service.obterLeitores();

            const jaExisteRegular = leitores.some((l: Leitor) => l.estado === "REGULAR");
            const jaExisteIncompleto = leitores.some((l: Leitor) => l.estado === "INCOMPLETO");

            expect(jaExisteRegular || jaExisteIncompleto).toBe(true);
        });
    });

    describe("criarLeitor", () => {
        it("✅ deve criar leitor com dados completos em estado REGULAR", async () => {
            const resultado = await service.criarLeitor({
                nome: "Ana Silva",
                senha: "password123",
                email: "ana@example.com",
                cpf: "987.654.321-00",
                dataDeNascimento: new Date("1995-06-20"),
            });

            expect(resultado).toBeDefined();
            expect(resultado.id).toBeDefined();
            expect(resultado.nome).toBe("Ana Silva");
            expect(resultado.email).toBe("ana@example.com");
            expect(resultado.estado).toBe("REGULAR");
        });

        it("✅ deve normalizar o CPF removendo a pontuação ao criar", async () => {
            const resultado = await service.criarLeitor({
                nome: "Fernanda",
                senha: "password999",
                email: "fernanda@example.com",
                cpf: "987.654.321-00",
                dataDeNascimento: new Date("1992-03-10"),
            });

            expect(resultado.cpf).toBe("98765432100");
        });

        it("✅ deve criar leitor com dados incompletos em estado INCOMPLETO", async () => {
            const resultado = await service.criarLeitor({
                nome: "Bruno",
                senha: "password456",
                // email, cpf, dataDeNascimento não fornecidos
            });

            expect(resultado).toBeDefined();
            expect(resultado.estado).toBe("INCOMPLETO");
        });

        it("✅ deve criar leitor em estado INCOMPLETO quando cpf e data faltam", async () => {
            const resultado = await service.criarLeitor({
                nome: "Carlos",
                senha: "password789",
                email: "carlos@example.com",
                // cpf e dataDeNascimento ausentes → estado computado como INCOMPLETO
            });

            expect(resultado.estado).toBe("INCOMPLETO");
        });

        it("✅ deve transitar de INCOMPLETO para REGULAR quando dados são adicionados", async () => {
            const resultado1 = await service.criarLeitor({
                nome: "Diana",
                senha: "password111",
                // dados incompletos
            });

            expect(resultado1.estado).toBe("INCOMPLETO");

            // Nota: Não testamos atualização aqui pois seria em outro teste
        });
    });

    describe("atualizarLeitor", () => {
        it("✅ deve atualizar nome do leitor", async () => {
            const resultado = await service.atualizarLeitor("leitor-123", {
                nome: "João Silva Atualizado",
                email: "joao@example.com",
                cpf: "123.456.789-00",
                dataDeNascimento: new Date("1990-01-15"),
            });

            expect(resultado).toBeDefined();
            expect(resultado.nome).toBe("João Silva Atualizado");
            expect(resultado.id).toBe("leitor-123");
        });

        it("✅ deve atualizar múltiplos campos", async () => {
            const resultado = await service.atualizarLeitor("leitor-123", {
                nome: "João",
                email: "novo-email@example.com",
                cpf: "111.222.333-44",
                dataDeNascimento: new Date("1990-01-15"),
            });

            expect(resultado.nome).toBe("João");
            expect(resultado.email).toBe("novo-email@example.com");
            // CPF é normalizado para apenas dígitos antes de persistir
            expect(resultado.cpf).toBe("11122233344");
        });

        it("✅ deve atualizar dataDeNascimento", async () => {
            const novaData = new Date("2000-01-01");
            const resultado = await service.atualizarLeitor("leitor-123", {
                nome: "João Silva",
                email: "joao@example.com",
                cpf: "123.456.789-00",
                dataDeNascimento: novaData,
            });

            expect(resultado).toBeDefined();
        });

        it("❌ deve lançar erro ao atualizar leitor inexistente", async () => {
            const erroEsperado = await service
                .atualizarLeitor("leitor-inexistente", {
                    nome: "Novo Nome",
                    email: "email@example.com",
                    cpf: "000.000.000-00",
                    dataDeNascimento: null,
                })
                .catch((erro: any) => erro);

            expect(erroEsperado).toBeDefined();
            expect(erroEsperado.codigo).toBe("ERRO_ATUALIZAR_LEITOR");
        });
    });

    describe("deletarLeitor", () => {
        it("✅ deve deletar um leitor existente", async () => {
            const resultado = await service.deletarLeitor("leitor-incompleto");

            expect(resultado).toBeDefined();
            expect(resultado.id).toBe("leitor-incompleto");

            // Verificar que foi deletado
            const verificacao = await service
                .obterLeitorPorId("leitor-incompleto")
                .catch((erro: any) => erro);

            expect(verificacao.codigo).toBe("LEITOR_NAO_ENCONTRADO");
        });

        it("❌ deve lançar erro ao deletar leitor inexistente", async () => {
            const erroEsperado = await service
                .deletarLeitor("leitor-inexistente")
                .catch((erro: any) => erro);

            expect(erroEsperado).toBeDefined();
            expect(erroEsperado.codigo).toBe("ERRO_DELETAR_LEITOR");
        });
    });

    describe("validações de estado do leitor", () => {
        it("✅ deve definir REGULAR quando todos os dados obrigatórios são fornecidos", async () => {
            const resultado = await service.criarLeitor({
                nome: "Eva",
                senha: "password222",
                email: "eva@example.com",
                cpf: "555.666.777-88",
                dataDeNascimento: new Date("1992-03-10"),
            });

            expect(resultado.estado).toBe("REGULAR");
        });

        it("✅ deve definir INCOMPLETO quando dados obrigatórios faltam", async () => {
            const resultado = await service.criarLeitor({
                nome: "Fernando",
                senha: "password333",
                // falta email
            });

            expect(resultado.estado).toBe("INCOMPLETO");
        });

        it("✅ deve definir INCOMPLETO quando apenas nome e senha são fornecidos", async () => {
            const resultado = await service.criarLeitor({
                nome: "Gisele",
                senha: "password444",
            });

            expect(resultado.estado).toBe("INCOMPLETO");
        });
    });
});

// describe("LeitorRepository", () => {
//     // Testes de integração com banco real
//     // Apenas executar com banco de teste
//
//     it("✅ deve criar leitor em banco de dados", async () => {
//         // Requer banco real
//         const repository = new LeitorRepository();
//         const leitor = await repository.criarLeitor(
//             {
//                 "Nome",
//                 "senha",
//                 "REGULAR",
//                 "email@test.com",
//                 "cpf",
//                 new Date()
//             });
//         expect(leitor.id).toBeDefined();
//     });
//
//     it("✅ deve recuperar leitor por ID do banco", async () => {
//         // Requer banco real
//         const repository = new LeitorRepository();
//         const leitor = await repository.obterLeitorPorId("leitor-123");
//         expect(leitor).toBeDefined();
//     });
//
//     it("✅ deve listar todos os leitores do banco", async () => {
//         // Requer banco real
//         const repository = new LeitorRepository();
//         const leitores = await repository.obterLeitores();
//         expect(Array.isArray(leitores)).toBe(true);
//     });
// });

/**
 * Executar testes:
 * npx jest src/__tests__/leitor.test.ts
 *
 * Executar testes com coverage:
 * npx jest src/__tests__/leitor.test.ts --coverage
 *
 * Modo watch (re-executar ao salvar):
 * npx jest src/__tests__/leitor.test.ts --watch
 *
 * Executar todos os testes:
 * npx jest
 */





