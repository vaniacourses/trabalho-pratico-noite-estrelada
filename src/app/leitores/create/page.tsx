"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card.tsx";
import { LeitorForm } from "@/components/leitores/LeitorForm";
import { Leitor } from "@prisma/client";

export default function CreateLeitorPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreateLeitor = async (
        data: Omit<Leitor, "id" | "estado" |"dataCriacao" | "dataAtualizacao" | "emprestimos" | "reservas">
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

            router.push("/leitores"); // Redirect to leitores list after creation
        } catch (error) {
            console.error("Error creating leitor:", error);
            alert("Erro ao criar leitor. Verifique o console para mais detalhes.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-1/4 mx-auto">
            <h1 className="text-3xl text-center font-bold mt-6 mb-5">
                Criar Novo Leitor
            </h1>
            <Card>
                <CardContent>
                    <LeitorForm
                        formMode={"create"}
                        onSubmit={handleCreateLeitor} isSubmitting={isSubmitting}
                    />
                </CardContent>
            </Card>
        </div>
    );
}