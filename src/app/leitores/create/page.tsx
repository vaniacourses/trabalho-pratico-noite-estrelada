"use client"

import {useState, Suspense} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/Card.tsx";
import {AuthenticatedLayout, PublicLayout} from "@/components/layout/Layout";
import {LeitorForm} from "@/components/leitores/LeitorForm";
import {Leitor} from "@prisma/client";

function CreateLeitorForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const fromLogin = searchParams.get("from") === "login";
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreateLeitor = async (
        data: Omit<Leitor, "id" | "estado" | "dataCriacao" | "dataAtualizacao" | "emprestimos" | "reservas">
    ) => {
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/leitores", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Failed to create leitor");
            }

            if (fromLogin) {
                sessionStorage.setItem(
                    'successMessage',
                    'Cadastro realizado com sucesso! Faça login para continuar.'
                );
                router.push("/login");
            } else {
                sessionStorage.setItem(
                    'successMessage',
                    'Leitor criado com sucesso!'
                );
                router.push("/leitores"); // Redirect to leitores list after creation
            }
        } catch (error) {
            console.error("Error creating leitor:", error);
            alert("Erro ao criar leitor. Verifique o console para mais detalhes.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formCard = (
        <Card className="shadow-premium">
            <CardHeader>
                <CardTitle>Dados do Leitor</CardTitle>
                <p className="text-brand-secondary mt-1 text-sm">
                    Preencha os campos abaixo para criar o cadastro.
                </p>
            </CardHeader>
            <CardContent>
                <LeitorForm
                    formMode={"create"}
                    onSubmit={handleCreateLeitor}
                    isSubmitting={isSubmitting}
                    backHref={fromLogin ? "/login" : "/leitores"}
                />
            </CardContent>
        </Card>
    );

    // Auto-cadastro (vindo do login): layout público, sem cabeçalho autenticado
    if (fromLogin) {
        return (
            <PublicLayout title="Cadastro de Leitor">
                {formCard}
            </PublicLayout>
        );
    }

    // Cadastro feito por funcionário: layout autenticado
    return (
        <AuthenticatedLayout title="Criar Novo Leitor" subtitle="Cadastre um novo leitor no sistema">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    {formCard}
                </div>
                <div>
                    <Card variant="secondary">
                        <CardHeader>
                            <CardTitle>
                                <span className="text-xl">Informações</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 text-sm text-brand-text/70">
                                <p>Os campos marcados com <strong className="text-brand-text">*</strong> são obrigatórios.</p>
                                <p>O <strong className="text-brand-text">CPF</strong> é opcional, mas deve estar no formato 000.000.000-00.</p>
                                <p>A <strong className="text-brand-text">senha</strong> será usada pelo leitor para acessar o portal.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default function CreateLeitorPage() {
    return (
        <Suspense fallback={null}>
            <CreateLeitorForm />
        </Suspense>
    );
}