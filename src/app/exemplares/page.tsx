import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AuthenticatedLayout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export default async function ExemplaresPage() {
  const exemplares = await prisma.exemplar.findMany({
    include: { midia: true },
    orderBy: { dataCriacao: "desc" },
  });

  return (
    <AuthenticatedLayout title="Exemplares" subtitle="Gerencie os exemplares disponíveis no acervo">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Exemplares</CardTitle>
            <Link
              href="/exemplar/create"
              className="inline-flex items-center justify-center rounded bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-primary-dark"
            >
              + Novo Exemplar
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {exemplares.length === 0 ? (
            <p>Nenhum exemplar encontrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-brand-secondary uppercase">
                    <th className="px-3 py-2">Código</th>
                    <th className="px-3 py-2">Mídia</th>
                    <th className="px-3 py-2">Tipo</th>
                    <th className="px-3 py-2">Estado</th>
                    <th className="px-3 py-2">Ações</th>
                    <th className="px-3 py-2">Criado</th>
                  </tr>
                </thead>
                <tbody>
                  {exemplares.map((e) => (
                    <tr key={e.id} className="border-t">
                      <td className="px-3 py-2">{e.codigo}</td>
                      <td className="px-3 py-2">{e.midia?.titulo || "-"}</td>
                      <td className="px-3 py-2">{e.midia?.tipo}</td>
                      <td className="px-3 py-2">{e.estado}</td>
                      <td className="px-3 py-2">
                        <Link href={`/exemplares/${e.id}`} className="inline-block">
                          <button className="text-sm px-3 py-1 rounded border border-brand-secondary/30 hover:bg-brand-bg">Visualizar</button>
                        </Link>
                      </td>
                      <td className="px-3 py-2">{new Date(e.dataCriacao).toLocaleString("pt-BR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AuthenticatedLayout>
  );
}
