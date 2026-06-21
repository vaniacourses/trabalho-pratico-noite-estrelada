"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthenticatedLayout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { NewExemplarForm } from "@/components/exemplares/NewExemplarForm";

interface MidiaOption {
  id: string;
  titulo: string;
}

export default function CreateExemplarPage() {
  const router = useRouter();
  const [midias, setMidias] = useState<MidiaOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const fetchMidias = async () => {
      try {
        const response = await fetch("/api/midias");
        const data = await response.json();

        if (!response.ok) {
          setAlert({ type: "error", message: data.erro?.mensagem || "Não foi possível carregar mídias." });
          return;
        }

        setMidias(data.dados || []);
      } catch (error: any) {
        setAlert({ type: "error", message: error?.message || "Erro ao carregar mídias." });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMidias();
  }, []);

  const onCreated = () => {
    setAlert({ type: "success", message: "Exemplar criado com sucesso." });
  };

  return (
    <AuthenticatedLayout title="Novo Exemplar" subtitle="Adicione um exemplar ao acervo">
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Inserir Exemplar</h1>
            <p className="text-brand-secondary">Use a página abaixo para adicionar um exemplar ao acervo.</p>
          </div>
          <Link href="/exemplares" className="rounded border border-brand-secondary px-4 py-2 text-sm text-brand-secondary hover:bg-brand-bg">
            Voltar à lista
          </Link>
        </div>

        {alert && (
          <div className="mb-6">
            <Alert
              variant={alert.type === "success" ? "success" : "error"}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Dados do Exemplar</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Carregando mídias...</p>
            ) : (
              <NewExemplarForm midias={midias} onCreated={onCreated} />
            )}
          </CardContent>
          <CardFooter>
            <button type="button" onClick={() => router.push("/exemplares")} className="btn btn-outline">
              Cancelar
            </button>
          </CardFooter>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
