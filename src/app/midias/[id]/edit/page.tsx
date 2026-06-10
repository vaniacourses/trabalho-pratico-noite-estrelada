"use client"

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {MidiaForm} from "@/components/midias/MidiaForm.tsx";
import {Midia} from "@prisma/client";
import {Card, CardContent} from "@/components/ui/Card.tsx";

export default function EditMidiaPage() {
    const {id} = useParams()
    const router = useRouter();
    const [midia, setLeitor] = useState<any>(null)
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetch(`/api/midias/${id}`)
            .then((r) => r.json())
            .then(setLeitor);
    }, [id]);

    const handleUpdateMidia = async (
        data: Omit<Midia, "id" | "estado" | "dataCriacao" | "emprestimos" | "reservas">
    ) => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/midias/${id}/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Failed to update midia");
            }

            sessionStorage.setItem(
                'successMessage',
                'Mídia atualizada com sucesso!'
            );

            // After successful update, redirect back to the view page for this media
            router.push(`/midias/${id}`);
        } catch (error) {
            console.error("Error creating midia:", error);
            alert("Erro ao atualizar mídia. Verifique o console para mais detalhes.");
        } finally {
            setIsSubmitting(false);
        }
    };


    if (!midia) {
        return (<div>Carregando...</div>);
    }
    return (
        <div className="w-1/4 mx-auto">
            <h1 className="text-3xl text-center font-bold mt-6 mb-5">
                Atualizar Mídia
            </h1>
            <Card>
                <CardContent>
                    <div>
                    </div>
                    <MidiaForm
                        initialData={
                            midia.dados
                        }
                        formMode={"edit"}
                        onSubmit={handleUpdateMidia} isSubmitting={isSubmitting}/>
                </CardContent>
            </Card>
        </div>
    );
}