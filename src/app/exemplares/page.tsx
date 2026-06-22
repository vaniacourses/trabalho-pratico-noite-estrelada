import Link from "next/link";
import { TipoDeMidia, EstadoExemplar } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AuthenticatedLayout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

const tipoOptions: Array<{ value: TipoDeMidia | ""; label: string }> = [
  { value: "", label: "Todos os tipos" },
  { value: "PUBLICACAO", label: "Publicação" },
  { value: "CD", label: "CD" },
  { value: "DVD", label: "DVD" },
];

const estadoOptions: Array<{ value: EstadoExemplar | ""; label: string }> = [
  { value: "", label: "Todos os estados" },
  { value: "DISPONIVEL", label: "Disponível" },
  { value: "EMPRESTADO", label: "Emprestado" },
  { value: "RESERVADO", label: "Reservado" },
  { value: "AFASTADO", label: "Afastado" },
];

interface ExemplaresPageProps {
  searchParams?: {
    term?: string | string[];
    selected?: string | string[];
    tipo?: string | string[];
    estado?: string | string[];
  };
}

function normalizeParam(value?: string | string[]) {
  if (value === undefined) return "";
  return Array.isArray(value) ? value.join(" ").trim() : value.trim();
}

export default async function ExemplaresPage({ searchParams }: ExemplaresPageProps) {
  const term = normalizeParam(searchParams?.term);
  const selected = normalizeParam(searchParams?.selected);
  const tipo = normalizeParam(searchParams?.tipo) as TipoDeMidia | "";
  const estado = normalizeParam(searchParams?.estado) as EstadoExemplar | "";

  const termOptions = term
    ? await prisma.exemplar.findMany({
        where: {
          OR: [
            { codigo: { contains: term, mode: "insensitive" } },
            { midia: { is: { titulo: { contains: term, mode: "insensitive" } } } },
          ],
        },
        include: { midia: true },
        orderBy: { dataCriacao: "desc" },
        take: 100,
        select: {
          id: true,
          codigo: true,
          midia: { select: { titulo: true } },
        },
      })
    : [];

  const filters: any[] = [];

  if (tipo) {
    filters.push({ midia: { is: { tipo } } });
  }
  if (estado) {
    filters.push({ estado });
  }
  if (selected) {
    filters.push({ id: selected });
  } else if (term) {
    filters.push({
      OR: [
        { codigo: { contains: term, mode: "insensitive" } },
        { midia: { is: { titulo: { contains: term, mode: "insensitive" } } } },
      ],
    });
  }

  const where = filters.length > 0 ? { AND: filters } : undefined;

  const exemplares = await prisma.exemplar.findMany({
    where,
    include: { midia: true },
    orderBy: { dataCriacao: "desc" },
  });

  return (
    <AuthenticatedLayout title="Exemplares" subtitle="Gerencie os exemplares disponíveis no acervo">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Exemplares</CardTitle>
            <div className="grid w-full gap-3 lg:grid-cols-[1.5fr_1fr] lg:items-end">
              <form method="get" className="grid gap-3 sm:grid-cols-[1.6fr_1fr] lg:grid-cols-[2fr_auto]">
                <div className="grid gap-2 sm:grid-cols-[1fr_1fr]">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase text-brand-secondary" htmlFor="term">
                      Buscar
                    </label>
                    <input
                      id="term"
                      name="term"
                      defaultValue={term}
                      placeholder="Digite código ou título..."
                      className="w-full rounded border px-2 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase text-brand-secondary" htmlFor="selected">
                      Resultado
                    </label>
                    <select
                      id="selected"
                      name="selected"
                      defaultValue={selected}
                      className="w-full rounded border px-2 py-2 text-sm"
                    >
                      <option value="">Todos os resultados</option>
                      {termOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.codigo} — {option.midia.titulo}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button type="submit" className="rounded bg-brand-primary px-4 py-2 text-sm font-semibold text-white">
                  Aplicar
                </button>
              </form>

              <div className="grid gap-3 sm:grid-cols-[1fr_1fr] lg:grid-cols-[1fr_1fr]">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-brand-secondary" htmlFor="tipo">
                    Tipo
                  </label>
                  <select
                    id="tipo"
                    name="tipo"
                    defaultValue={tipo}
                    className="w-full rounded border px-2 py-2 text-sm"
                  >
                    {tipoOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-brand-secondary" htmlFor="estado">
                    Estado
                  </label>
                  <select
                    id="estado"
                    name="estado"
                    defaultValue={estado}
                    className="w-full rounded border px-2 py-2 text-sm"
                  >
                    {estadoOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Link
                href="/exemplar/create"
                className="inline-flex items-center justify-center rounded bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-primary-dark"
              >
                + Novo Exemplar
              </Link>
            </div>
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
