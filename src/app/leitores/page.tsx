import {Leitor} from "@prisma/client";
import {leitorService} from "@/container/leitor.container.ts";
import {formatDate} from "@/utils/helpers.ts";
import Link from "next/link";

export async function LeitoresPage() {
    const leitores: Leitor[] = await leitorService.obterLeitores();

    return (
        <main>
            <div className={"flex justify-between items-center mb-6"}>
                <div className={"flex justify-around items-center mb-6"}>
                    <h1 className="text-3xl font-bold">
                        Lista de Leitores
                    </h1>
                    <button className={"btn btn-primary"}>Adicionar Leitor</button>
                </div>
                <div className="bg-white rounded shadow">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b">
                            <th className="text-left p-4">Nome</th>
                            <th className="text-left p-4">Email</th>
                            <th className="text-left p-4">CPF</th>
                            <th className="text-left p-4">Data de Nascimento</th>
                            <th className="text-left p-4">Estado</th>
                            <th className="text-left p-4">Ações</th>
                        </tr>
                        </thead>
                        <tbody>
                        {leitores.map((leitor) => (
                            <tr key={leitor.id}>
                                <td className="p-4">{leitor.nome}</td>
                                <td className="p-4">{leitor.email || "-"}</td>
                                <td className="p-4">{leitor.cpf || "-"}</td>
                                <td className="p-4">{formatDate(leitor.dataDeNascimento) || "-"}</td>
                                <td className="p-4">{leitor.estado}</td>
                                <td className="p-4">
                                    <Link href={`/leitores/${leitor.id}/editar`}>
                                        <button className="btn btn-sm btn-secondary mr-2">
                                            Editar
                                        </button>
                                    </Link>
                                    <button className="btn btn-sm btn-danger"
                                            onClick={() =>
                                                leitorService.deletarLeitor(leitor.id)}>
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {leitores.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            Nenhum leitor encontrado.
                        </div>
                    )}

                </div>
            </div>
        </main>
    );
}