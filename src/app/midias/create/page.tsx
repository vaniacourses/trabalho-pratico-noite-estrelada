"use client"

import {useState} from "react";
import {useRouter} from "next/navigation";
import {Midia} from "@prisma/client";
import {MidiaForm} from "@/src/components/midias/MidiaForm.tsx";
import {Card, CardContent} from "@/src/components/ui/Card.tsx";

export default function CreateMidiaPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreateMidia = async (
        data: Omit<Midia, "id" | "dataCriacao" | "emprestimos" | "reservas">
    ) => {
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/midias", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Failed to create media");
            }

            sessionStorage.setItem(
                'successMessage',
                'Mídia criado com sucesso!'
            );

            router.push("/midias"); // Redirect to leitores list after creation
        } catch (error) {
            console.error("Error creating media:", error);
            alert("Erro ao criar mídia. Verifique o console para mais detalhes.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-1/4 mx-auto">
            <h1 className="text-3xl text-center font-bold mt-6 mb-5">
                Criar Nova Mídia
            </h1>
            <Card>
                <CardContent>
                    <MidiaForm
                        formMode={"create"}
                        onSubmit={handleCreateMidia} isSubmitting={isSubmitting}
                    />
                </CardContent>
            </Card>
        </div>
    );
}