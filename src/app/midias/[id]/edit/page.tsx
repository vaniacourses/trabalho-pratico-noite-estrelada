"use client"

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {Card, CardContent} from "@/components/ui/Card.tsx";
import {LeitorForm} from "@/components/leitores/LeitorForm";
import {Leitor} from "@prisma/client";

export default function EditLeitorPage() {
    const {id} = useParams()
    const router = useRouter();
    const [leitor, setLeitor] = useState<any>(null)
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetch(`/api/midias/${id}`)
            .then((r) => r.json())
            .then(setLeitor);
    }, [id]);

    const handleUpdateLeitor = async (
        data: Omit<Leitor, "id" | "estado" | "dataCriacao" | "dataAtualizacao" | "emprestimos" | "reservas">
    ) => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/leitores/${id}/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Failed to update leitor");
            }

            sessionStorage.setItem(
                'successMessage',
                'Leitor atualizado com sucesso!'
            );

            router.push("/leitores"); // Redirect to leitores list after creation
        } catch (error) {
            console.error("Error creating leitor:", error);
            alert("Erro ao atualizar leitor. Verifique o console para mais detalhes.");
        } finally {
            setIsSubmitting(false);
        }
    };


    if (!leitor) {
        return (<div>Carregando...</div>);
    }
    return (
        <div className="w-1/4 mx-auto">
            <h1 className="text-3xl text-center font-bold mt-6 mb-5">
                Atualizar Leitor
            </h1>
            <Card>
                <CardContent>
                    <div>
                    </div>
                    <LeitorForm
                        initialData={
                            leitor.dados
                        }
                        formMode={"edit"}
                        onSubmit={handleUpdateLeitor} isSubmitting={isSubmitting}/>
                </CardContent>
            </Card>
        </div>
    );
}