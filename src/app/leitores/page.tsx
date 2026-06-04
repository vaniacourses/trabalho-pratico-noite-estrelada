import {Leitor} from "@prisma/client";
import {LeitorService} from "@/services/leitorService.ts";

export async function LeitoresPage() {
    const leitorService = new LeitorService();
    const leitores: Leitor[] = await leitorService.obterLeitores();

    return (
        <main>
            <div className={"flex justify-between items-center mb-6"}>
                <h1 className="text-3xl font-bold">
                    Lista de Leitores
                </h1>
                <button className={"btn btn-primary"}>Adicionar Leitor</button>

                <div className="bg-white rounded shadow">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b">
                            <th className="text-left p-4">Nome</th>
                            <th className="text-left p-4">Email</th>
                            <th className="text-left p-4">Data de Nascimento</th>
                            <th className="text-left p-4">CPF</th>
                            <th className="text-left p-4">Ações</th>
                        </tr>
                        </thead>
                        <tbody>
                        {leitores.map((leitor) => (
                            <tr key={leitor.id}>
                                <td className="p-4">{leitor.nome}</td>
                                <td className="p-4">{leitor.email}</td>
                                <td className="p-4">
                                    <button className="btn btn-sm btn-secondary mr-2">Editar</button>
                                    <button className="btn btn-sm btn-danger">Exlcuir</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </main>
    );
}