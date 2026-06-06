/**
 * Testes para a página de Leitores (LeitoresPage) - Client Component
 *
 * Este arquivo testa o componente de listagem de leitores usando React Testing Library
 *
 * Para executar testes:
 * npx jest src/app/leitores/__tests__/page.test.tsx
 */

/// <reference types="jest" />
import '@testing-library/jest-dom';
import React from "react";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import type {Leitor} from "@prisma/client";

// Mock do fetch global
global.fetch = jest.fn();

// Mock de helpers (usando caminho relativo)
jest.mock("../../../utils/helpers", () => ({
    formatDate: (date: Date | undefined) => {
        if (!date) return null;
        return new Date(date).toLocaleDateString("pt-BR");
    },
}));

// Mock do Next.js Link
jest.mock("next/link", () => {
    return ({children, href}: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    );
});

// Importar o componente após os mocks
import LeitoresPage from "../page";

describe("LeitoresPage - Client Component", () => {
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
            estado: "REGULAR",
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
        (global.fetch as jest.Mock).mockClear();
    });

    describe("renderização com dados", () => {
        it("✅ deve renderizar a página com título", async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({sucesso: true, dados: []}),
            });

            render(<LeitoresPage/>);

            await expect(screen.findByText("Lista de Leitores")).resolves.toBeInTheDocument();
        });

        it("✅ deve carregar e exibir lista de leitores", async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({sucesso: true, dados: leitoresValidos}),
            });

            render(<LeitoresPage/>);

            // Aguardar o carregamento completo
            await waitFor(() => {
                expect(screen.getByText("João Silva")).toBeInTheDocument();
            });

            expect(screen.getByText("joao@example.com")).toBeInTheDocument();
            expect(screen.getByText("maria@example.com")).toBeInTheDocument();
        });

        it("✅ deve exibir '-' para campos vazios", async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({sucesso: true, dados: [leitorSemDados]}),
            });

            render(<LeitoresPage/>);

            const dashElements = await screen.findAllByText("-");
            expect(dashElements.length).toBeGreaterThanOrEqual(3);
        });
    });

    describe("renderização vazia", () => {
        it("✅ deve exibir mensagem quando não há leitores", async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({sucesso: true, dados: []}),
            });

            render(<LeitoresPage/>);

            await expect(screen.findByText("Nenhum leitor encontrado.")).resolves.toBeInTheDocument();
        });
    });

    describe("botões e ações", () => {
        it("✅ deve exibir botão 'Editar' para cada leitor", async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({sucesso: true, dados: leitoresValidos}),
            });

            render(<LeitoresPage/>);

            const editBotoes = await screen.findAllByText("Editar");
            expect(editBotoes.length).toBe(leitoresValidos.length);
        });

        it("✅ deve exibir botão 'Excluir' para cada leitor", async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({sucesso: true, dados: leitoresValidos}),
            });

            render(<LeitoresPage/>);

            const excluirBotoes = await screen.findAllByText("Excluir");
            expect(excluirBotoes.length).toBe(leitoresValidos.length);
        });

        it("✅ deve chamar DELETE ao clicar botão 'Excluir'", async () => {
            (global.fetch as jest.Mock)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({sucesso: true, dados: leitoresValidos}),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({sucesso: true, mensagem: "Leitor deletado com sucesso"}),
                });

            render(<LeitoresPage/>);

            const excluirBotoes = await screen.findAllByText("Excluir");
            const primeiroBotaoExcluir = excluirBotoes[0];

            fireEvent.click(primeiroBotaoExcluir);

            // Verificar que a fetch foi chamada com DELETE
            await waitFor(() => {
                const calls = (global.fetch as jest.Mock).mock.calls;
                expect(calls[1][0]).toContain(`/api/leitores/${leitoresValidos[0].id}`);
                expect(calls[1][1].method).toBe("DELETE");
            });

            // Verificar que o alert de sucesso foi exibido
            await expect(screen.findByText("Leitor deletado com sucesso")).resolves.toBeInTheDocument();
        });

        it("✅ deve exibir erro ao deletar falhar", async () => {
            (global.fetch as jest.Mock)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({sucesso: true, dados: leitoresValidos}),
                })
                .mockResolvedValueOnce({
                    ok: false,
                    json: async () => ({
                        sucesso: false,
                        erro: {
                            codigo: "LEITOR_NAO_ENCONTRADO",
                            mensagem: "Leitor não encontrado",
                        },
                    }),
                });

            render(<LeitoresPage/>);

            const excluirBotoes = await screen.findAllByText("Excluir");
            const primeiroBotaoExcluir = excluirBotoes[0];

            fireEvent.click(primeiroBotaoExcluir);

            // Verificar que o alert de erro foi exibido
            await expect(screen.findByText("Leitor não encontrado")).resolves.toBeInTheDocument();
        });

        it("✅ deve linkar para página de edição corretamente", async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({sucesso: true, dados: leitoresValidos}),
            });

            render(<LeitoresPage/>);

            const links = await screen.findAllByRole("link");
            console.log(links)
            const editLinks = links.filter((link) =>
                link.getAttribute("href")?.includes("/edit")
            );

            expect(editLinks.length).toBe(leitoresValidos.length);
            expect(editLinks[0].getAttribute("href")).toBe("/leitores/leitor-1/edit");
            expect(editLinks[1].getAttribute("href")).toBe("/leitores/leitor-2/edit");
        });
    });

    describe("integração com API", () => {
        it("✅ deve fazer fetch ao renderizar", async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({sucesso: true, dados: []}),
            });

            render(<LeitoresPage/>);

            await expect(screen.findByText("Lista de Leitores")).resolves.toBeInTheDocument();
            expect(global.fetch).toHaveBeenCalledWith("/api/leitores");
        });

        it("✅ deve remover leitor da lista após deletar", async () => {
            (global.fetch as jest.Mock)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({sucesso: true, dados: leitoresValidos}),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({sucesso: true, mensagem: "Leitor deletado com sucesso"}),
                });

            render(<LeitoresPage/>);

            // Aguardar o carregamento inicial
            await waitFor(() => {
                expect(screen.getByText("João Silva")).toBeInTheDocument();
            });

            // Verificar que há 2 leitores
            let linhas = screen.getAllByRole("row");
            expect(linhas.length).toBe(3); // 1 header + 2 dados

            // Clicar no primeiro botão Excluir
            const excluirBotoes = await screen.findAllByText("Excluir");
            fireEvent.click(excluirBotoes[0]);

            // Aguardar a deleção e verificação
            await waitFor(() => {
                const remainingExcluir = screen.getAllByText("Excluir");
                expect(remainingExcluir.length).toBe(1); // Apenas 1 leitor restante
            });
        });
    });

    describe("estrutura HTML", () => {
        it("✅ deve renderizar com elemento main", async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({sucesso: true, dados: []}),
            });

            render(<LeitoresPage/>);

            await expect(screen.findByText("Lista de Leitores")).resolves.toBeInTheDocument();
            const main = document.querySelector("main");
            expect(main).toBeInTheDocument();
        });

        it("✅ deve renderizar tabela com thead e tbody", async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({sucesso: true, dados: leitoresValidos}),
            });

            render(<LeitoresPage/>);

            await expect(screen.findByRole("table")).resolves.toBeInTheDocument();
            const thead = document.querySelector("thead");
            const tbody = document.querySelector("tbody");

            expect(thead).toBeInTheDocument();
            expect(tbody).toBeInTheDocument();
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









