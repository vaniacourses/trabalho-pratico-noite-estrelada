/**
 * Testes para a página de Leitores (LeitoresPage)
 *
 * Este arquivo testa o componente de listagem de leitores usando React Testing Library
 *
 * Para executar testes:
 * npm install --save-dev @testing-library/react @testing-library/jest-dom
 * npx jest src/app/leitores/__tests__/page.test.tsx
 */

/// <reference types="jest" />
import '@testing-library/jest-dom';
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import type { Leitor } from "@prisma/client";

// Mock do container (usando caminho relativo) - Usar função para evitar hoisting
jest.mock("../../../container/leitor.container", () => ({
  leitorService: {
    obterLeitores: jest.fn(),
    obterLeitorPorId: jest.fn(),
    criarLeitor: jest.fn(),
    atualizarLeitor: jest.fn(),
    deletarLeitor: jest.fn(),
  },
}));

// Mock de helpers (usando caminho relativo)
jest.mock("../../../utils/helpers", () => ({
  formatDate: (date: Date | undefined) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("pt-BR");
  },
}));

// Mock do Next.js Link
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// Agora importar o componente e o serviço APÓS os mocks
import { LeitoresPage } from "../page";
import { leitorService as mockLeitorService } from "../../../container/leitor.container";

// Provide a typed mock reference so editors/TypeScript recognize Jest mock methods
const mockedLeitorService = mockLeitorService as unknown as jest.Mocked<typeof mockLeitorService>;

describe("LeitoresPage", () => {
  const leitoresValidos: Leitor[] = [
    {
      id: "leitor-1",
      nome: "João Silva",
      email: "joao@example.com",
      cpf: "123.456.789-00",
      dataDeNascimento: new Date("1990-01-15"),
      senha: "hashed_pass_1",
      estado: "REGULAR",
      dataCriacao: new Date(),
      dataAtualizacao: new Date(),
    },
    {
      id: "leitor-2",
      nome: "Maria Costa",
      email: "maria@example.com",
      cpf: "987.654.321-00",
      dataDeNascimento: new Date("1995-06-20"),
      senha: "hashed_pass_2",
      estado: "INCOMPLETO",
      dataCriacao: new Date(),
      dataAtualizacao: new Date(),
    },
  ];

  const leitorSemDados: Leitor = {
    id: "leitor-3",
    nome: "Carlos",
    email: "",
    cpf: "",
    dataDeNascimento: undefined as any,
    senha: "hashed_pass_3",
    estado: "INCOMPLETO",
    dataCriacao: new Date(),
    dataAtualizacao: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("renderização com dados", () => {
    it("✅ deve renderizar a página com título", async () => {
      mockedLeitorService.obterLeitores.mockResolvedValue([]);

      render(await LeitoresPage());

      expect(screen.getByText("Lista de Leitores")).toBeInTheDocument();
    });

    it("✅ deve exibir tabela com colunas corretas", async () => {
      mockedLeitorService.obterLeitores.mockResolvedValue([]);

      render(await LeitoresPage());

      expect(screen.getByText("Nome")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("CPF")).toBeInTheDocument();
      expect(screen.getByText("Data de Nascimento")).toBeInTheDocument();
      expect(screen.getByText("Estado")).toBeInTheDocument();
      expect(screen.getByText("Ações")).toBeInTheDocument();
    });

    it("✅ deve exibir lista de leitores", async () => {
      mockedLeitorService.obterLeitores.mockResolvedValue(leitoresValidos);

      render(await LeitoresPage());

      // Verificar se nomes aparecem
      expect(screen.getByText("João Silva")).toBeInTheDocument();
      expect(screen.getByText("Maria Costa")).toBeInTheDocument();

      // Verificar se emails aparecem
      expect(screen.getByText("joao@example.com")).toBeInTheDocument();
      expect(screen.getByText("maria@example.com")).toBeInTheDocument();

      // Verificar se CPFs aparecem
      expect(screen.getByText("123.456.789-00")).toBeInTheDocument();
      expect(screen.getByText("987.654.321-00")).toBeInTheDocument();

      // Verificar se estados aparecem
      expect(screen.getAllByText("REGULAR")[0]).toBeInTheDocument();
      expect(screen.getByText("INCOMPLETO")).toBeInTheDocument();
    });

    it("✅ deve formatar data de nascimento corretamente", async () => {
      mockedLeitorService.obterLeitores.mockResolvedValue(leitoresValidos);

      render(await LeitoresPage());

      // A data formatada dependerá da localização (pt-BR) e timezone
      // Verificar que uma data formatada está presente (pode ter offset de 1 dia por timezone)
      const dataNascimento1 = screen.getByText(/1[45]\/01\/1990|1990-01-1[45]/);
      expect(dataNascimento1).toBeInTheDocument();
    });

    it("✅ deve exibir '-' para campos vazios (email, cpf, data)", async () => {
      mockedLeitorService.obterLeitores.mockResolvedValue([leitorSemDados]);

      render(await LeitoresPage());

      // Verificar que "-" aparece para campos vazios
      const dashElements = screen.getAllByText("-");
      expect(dashElements.length).toBeGreaterThanOrEqual(3); // email, cpf, data
    });
  });

  describe("renderização vazia", () => {
    it("✅ deve exibir mensagem quando não há leitores", async () => {
      mockedLeitorService.obterLeitores.mockResolvedValue([]);

      render(await LeitoresPage());

      expect(screen.getByText("Nenhum leitor encontrado.")).toBeInTheDocument();
    });
  });

  describe("botões e ações", () => {
    it("✅ deve exibir botão 'Adicionar Leitor'", async () => {
      mockedLeitorService.obterLeitores.mockResolvedValue([]);

      render(await LeitoresPage());

      expect(screen.getByText("Adicionar Leitor")).toBeInTheDocument();
    });

    it("✅ deve exibir botão 'Editar' para cada leitor", async () => {
      mockedLeitorService.obterLeitores.mockResolvedValue(leitoresValidos);

      render(await LeitoresPage());

      const editBotoes = screen.getAllByText("Editar");
      expect(editBotoes.length).toBe(leitoresValidos.length);
    });

    it("✅ deve exibir botão 'Excluir' para cada leitor", async () => {
      mockedLeitorService.obterLeitores.mockResolvedValue(leitoresValidos);

      render(await LeitoresPage());

      const excluirBotoes = screen.getAllByText("Excluir");
      expect(excluirBotoes.length).toBe(leitoresValidos.length);
    });

    it("✅ deve chamar deletarLeitor ao clicar botão 'Excluir'", async () => {
      mockedLeitorService.obterLeitores.mockResolvedValue(leitoresValidos);
      mockedLeitorService.deletarLeitor.mockResolvedValue(leitoresValidos[0]);

      render(await LeitoresPage());

      // Contar número inicial de linhas (header + dados)
      let linhasAntesDelete = screen.getAllByRole("row");
      const numLinhasAntesDelete = linhasAntesDelete.length;
      expect(numLinhasAntesDelete).toBe(3); // 1 header + 2 leitores

      // Encontrar e clicar no primeiro botão 'Excluir'
      const excluirBotoes = screen.getAllByText("Excluir");
      const primeiroBotaoExcluir = excluirBotoes[0];

      fireEvent.click(primeiroBotaoExcluir);

      // Verificar que deletarLeitor foi chamado com o ID correto
      expect(mockedLeitorService.deletarLeitor).toHaveBeenCalledWith(
        leitoresValidos[0].id
      );
      expect(mockedLeitorService.deletarLeitor).toHaveBeenCalledTimes(1);
    });

    it("✅ deve linkar para página de edição corretamente", async () => {
      mockedLeitorService.obterLeitores.mockResolvedValue(leitoresValidos);

      render(await LeitoresPage());

      const links = screen.getAllByRole("link");
      // Deve haver links para editar cada leitor
      const editLinks = links.filter((link) =>
        link.getAttribute("href")?.includes("/editar")
      );

      expect(editLinks.length).toBe(leitoresValidos.length);
      expect(editLinks[0].getAttribute("href")).toBe("/leitores/leitor-1/editar");
      expect(editLinks[1].getAttribute("href")).toBe("/leitores/leitor-2/editar");
    });
  });

  describe("integração com serviço", () => {
    it("✅ deve chamar leitorService.obterLeitores ao renderizar", async () => {
      mockedLeitorService.obterLeitores.mockResolvedValue([]);

      render(await LeitoresPage());

      expect(mockedLeitorService.obterLeitores).toHaveBeenCalled();
    });

    it("✅ deve lidar com múltiplos leitores", async () => {
      const muitosLeitores: Leitor[] = Array.from({ length: 10 }, (_, i) => ({
        id: `leitor-${i}`,
        nome: `Leitor ${i}`,
        email: `leitor${i}@example.com`,
        cpf: `${String(i).padStart(3, "0")}.456.789-00`,
        dataDeNascimento: new Date(`199${(i % 10)}-01-15`),
        senha: `hashed_pass_${i}`,
        estado: i % 2 === 0 ? ("REGULAR" as const) : ("INCOMPLETO" as const),
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
      }));

      mockedLeitorService.obterLeitores.mockResolvedValue(muitosLeitores);

      render(await LeitoresPage());

      // Verificar que todos os leitores foram renderizados
      for (let i = 0; i < 10; i++) {
        expect(screen.getByText(`Leitor ${i}`)).toBeInTheDocument();
      }

      // Verificar que há 10 linhas de dados
      const linhas = screen.getAllByRole("row");
      expect(linhas.length).toBe(11); // 1 header + 10 dados
    });
  });

  describe("estrutura HTML", () => {
    it("✅ deve renderizar uma tabela com corpo e cabeçalho", async () => {
      mockedLeitorService.obterLeitores.mockResolvedValue(leitoresValidos);

      render(await LeitoresPage());

      const tabelas = screen.getAllByRole("table");
      expect(tabelas.length).toBeGreaterThan(0);

      // Verificar estrutura de tabela
      const thead = document.querySelector("thead");
      const tbody = document.querySelector("tbody");

      expect(thead).toBeInTheDocument();
      expect(tbody).toBeInTheDocument();
    });

    it("✅ deve ter página encapsulada em elemento main", async () => {
      mockedLeitorService.obterLeitores.mockResolvedValue([]);

      render(await LeitoresPage());

      const main = document.querySelector("main");
      expect(main).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("✅ deve lidar corretamente com dados especiais (caracteres UTF-8)", async () => {
      const leitorEspecial: Leitor = {
        id: "leitor-especial",
        nome: "José da Silva Açúcar",
        email: "josé@example.com",
        cpf: "000.000.000-00",
        dataDeNascimento: new Date("1985-03-25"),
        senha: "hashed_pass",
        estado: "REGULAR",
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
      };

      mockedLeitorService.obterLeitores.mockResolvedValue([leitorEspecial]);

      render(await LeitoresPage());

      expect(screen.getByText("José da Silva Açúcar")).toBeInTheDocument();
      expect(screen.getByText("josé@example.com")).toBeInTheDocument();
    });

    it("✅ deve misturar leitores completos e incompletos", async () => {
      const leitoresMistos: Leitor[] = [
        leitoresValidos[0],
        leitorSemDados,
        leitoresValidos[1],
      ];

      mockedLeitorService.obterLeitores.mockResolvedValue(leitoresMistos);

      render(await LeitoresPage());

      // Verificar que ambos tipos aparecem
      expect(screen.getByText("João Silva")).toBeInTheDocument();
      expect(screen.getByText("Carlos")).toBeInTheDocument();
      expect(screen.getByText("Maria Costa")).toBeInTheDocument();

      // Verificar que campos faltando mostram "-"
      const dashElements = screen.getAllByText("-");
      expect(dashElements.length).toBeGreaterThan(0);
    });
  });
});

/**
 * Executar testes:
 * npx jest src/app/leitores/__tests__/page.test.tsx
 *
 * Executar testes com coverage:
 * npx jest src/app/leitores/__tests__/page.test.tsx --coverage
 *
 * Modo watch (re-executar ao salvar):
 * npx jest src/app/leitores/__tests__/page.test.tsx --watch
 *
 * Executar todos os testes:
 * npx jest
 */









