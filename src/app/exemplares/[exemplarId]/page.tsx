import { formatDate, formatDateTime } from "@/utils/helpers";
import { prisma } from "@/lib/prisma";
import { mediaTranslate } from "@/domain/translation";
import { AuthenticatedLayout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface ExemplarDetailPageProps {
  params: {
    exemplarId: string;
  };
}

function renderDetailRow(label: string, value: React.ReactNode) {
  return (
    <div className="flex justify-between gap-4 py-3 border-b border-brand-secondary/10 last:border-0">
      <span className="text-sm font-semibold text-brand-secondary">{label}</span>
      <span className="text-sm text-brand-text text-right">{value}</span>
    </div>
  );
}

export default async function ExemplarByIdPage({ params }: ExemplarDetailPageProps) {
  const { exemplarId } = (await params) as { exemplarId: string };

  console.log('ExemplarByIdPage param exemplarId=', exemplarId);

  if (!exemplarId) {
    return (
      <AuthenticatedLayout title="Detalhes do Exemplar">
        <div className="max-w-3xl mx-auto p-6">
          <Card>
            <CardContent>
              <p className="text-center text-brand-secondary py-8">Exemplar não encontrado.</p>
            </CardContent>
          </Card>
        </div>
      </AuthenticatedLayout>
    );
  }

  let exemplar = await prisma.exemplar.findUnique({
    where: { id: exemplarId },
    include: {
      midia: true,
      emprestimos: {
        orderBy: { dataInicio: "desc" },
        include: { leitor: true },
      },
    },
  });

  // fallback: maybe the route used the exemplar.codigo instead of id
  if (!exemplar) {
    exemplar = await prisma.exemplar.findUnique({
      where: { codigo: exemplarId },
      include: {
        midia: true,
        emprestimos: {
          orderBy: { dataInicio: "desc" },
          include: { leitor: true },
        },
      },
    });
  }

  if (!exemplar) {
    return (
      <AuthenticatedLayout title="Detalhes do Exemplar">
        <div className="max-w-3xl mx-auto p-6">
          <Card>
            <CardContent>
              <p className="text-center text-brand-secondary py-8">Exemplar não encontrado.</p>
            </CardContent>
          </Card>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout title="Detalhes do Exemplar" subtitle="Informações completas e histórico de empréstimos">
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-text">{exemplar.codigo}</h1>
            <p className="text-sm text-brand-secondary">Exemplar do acervo</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={exemplar.midia ? `/midias/${exemplar.midia.id}/exemplares` : '/exemplares'}>
              <Button variant="outline">Voltar</Button>
            </Link>
            {exemplar.midia && (
              <Link href={`/midias/${exemplar.midia.id}/exemplares/${exemplar.id}/edit`}>
                <Button variant="primary">Editar Exemplar</Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <Card className="shadow-premium">
            <CardHeader>
              <CardTitle>Dados do Exemplar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {renderDetailRow("Código", exemplar.codigo)}
              {renderDetailRow("Estado", exemplar.estado)}
              {renderDetailRow("Criado em", formatDate(exemplar.dataCriacao))}
              {renderDetailRow("Atualizado em", formatDate(exemplar.dataAtualizacao))}
              {renderDetailRow("Mídia", exemplar.midia?.titulo ?? "-")}
              {renderDetailRow("Tipo de mídia", mediaTranslate[exemplar.midia?.tipo ?? "PUBLICACAO"] ?? exemplar.midia?.tipo)}
              {exemplar.midia?.dados && (
                <div className="space-y-2 pt-4">
                  <span className="block text-sm font-semibold text-brand-secondary">Dados da mídia</span>
                  <pre className="whitespace-pre-wrap rounded border border-brand-secondary/20 bg-brand-bg p-4 text-sm text-brand-text">{JSON.stringify(exemplar.midia.dados, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-premium">
            <CardHeader>
              <CardTitle>Histórico de Empréstimos</CardTitle>
            </CardHeader>
            <CardContent>
              {exemplar.emprestimos.length === 0 ? (
                <p className="text-sm text-brand-secondary">Nenhum empréstimo registrado para este exemplar.</p>
              ) : (
                <div className="space-y-4">
                  {exemplar.emprestimos.map((emprestimo) => (
                    <div key={emprestimo.id} className="rounded border border-brand-secondary/20 bg-white p-4 shadow-sm">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-semibold text-brand-text">{emprestimo.leitor?.nome || "Leitor desconhecido"}</p>
                        <span className="text-xs uppercase tracking-[0.15em] text-brand-secondary">{emprestimo.estado}</span>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2 mt-3 text-sm text-brand-text/90">
                        <div>
                          <span className="block text-brand-secondary">Início</span>
                          <span>{formatDateTime(emprestimo.dataInicio)}</span>
                        </div>
                        <div>
                          <span className="block text-brand-secondary">Expira</span>
                          <span>{formatDateTime(emprestimo.dataExpiracao)}</span>
                        </div>
                        <div>
                          <span className="block text-brand-secondary">Finalizado em</span>
                          <span>{emprestimo.dataFinalizacao ? formatDateTime(emprestimo.dataFinalizacao) : "Não finalizado"}</span>
                        </div>
                        <div>
                          <span className="block text-brand-secondary">Leitor ID</span>
                          <span>{emprestimo.idLeitor}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
