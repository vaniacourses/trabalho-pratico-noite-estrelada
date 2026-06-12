"use client"

import {useState} from "react";
import {useRouter} from "next/navigation";
import {Midia} from "@prisma/client";
import {Card, CardContent} from "@/components/ui/Card.tsx";
import {MidiaForm} from "@/components/midias/MidiaForm.tsx";

interface AlertState {
    show: boolean;
    message: string;
    tipo: 'sucesso' | 'erro';
    erros?: Record<string, string>;
}

export default function CreateMidiaPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alert, setAlert] = useState<AlertState>({show: false, message: '', tipo: 'sucesso'});

    // relações (emprestimos, reservas) e 'estado' (inexistente em Midia) removidos do Omit
    const handleCreateMidia = async (
        data: Omit<Midia, "id" | "dataCriacao">
    ) => {
        setIsSubmitting(true);
        setAlert({show: false, message: '', tipo: 'sucesso'});

        try {
            const response = await fetch("/api/midias", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();

            if (!response.ok) {
                const validationErrors = responseData.erro?.erros;
                setAlert({
                    show: true,
                    message: responseData.erro?.mensagem || 'Erro ao criar mídia',
                    tipo: 'erro',
                    erros: validationErrors
                });
                return;
            }

            sessionStorage.setItem(
                'successMessage',
                'Mídia criada com sucesso!'
            );

            router.push("/midias");
        } catch (error) {
            console.error("Error creating media:", error);
            setAlert({
                show: true,
                message: 'Erro ao criar mídia. Verifique o console para mais detalhes.',
                tipo: 'erro'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-1/4 mx-auto">
            <h1 className="text-3xl text-center font-bold mt-6 mb-5">
                Criar Nova Mídia
            </h1>

            {alert.show && (
                <div
                    className={`mb-4 p-4 rounded border-l-4 ${
                        alert.tipo === 'sucesso' ? `alert-success` : `alert-fail`
                    }`}
                    role="alert"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            {alert.tipo === 'sucesso' ? (
                                <span className="mr-3 text-lg font-bold">✓</span>
                            ) : (
                                <span className="mr-3 text-lg font-bold">✕</span>
                            )}
                            <div>
                                <span>{alert.message}</span>
                                {alert.erros && Object.keys(alert.erros).length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-sm font-semibold mb-2">Houve os seguintes erros na criação:</p>
                                        <ul className="list-disc list-inside space-y-1">
                                            {Object.entries(alert.erros).map(([key, value]) => (
                                                <li key={key} className="text-sm">{value}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            type="button"
                            className={`ml-4 text-lg font-bold hover:opacity-70 transition-opacity ${
                                alert.tipo === 'sucesso' ? 'text-green-700' : 'text-red-700'
                            }`}
                            onClick={() => setAlert(prev => ({...prev, show: false}))}
                            aria-label="Close"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

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