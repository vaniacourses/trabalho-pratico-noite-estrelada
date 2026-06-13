"use client"

import {useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {Card, CardContent} from "@/components/ui/Card.tsx";
import {ExemplarForm} from "@/components/exemplares/ExemplarForm.tsx";

interface AlertState {
    show: boolean;
    message: string;
    tipo: 'sucesso' | 'erro';
    erros?: Record<string, string>;
}

export default function CreateExemplarPage() {
    const {id} = useParams();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alert, setAlert] = useState<AlertState>({show: false, message: '', tipo: 'sucesso'});

    const handleCreateExemplar = async (data: {idMidia: string; codigo: string}) => {
        setIsSubmitting(true);
        setAlert({show: false, message: '', tipo: 'sucesso'});

        try {
            const response = await fetch(`/api/midias/${id}/exemplares`, {
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
                    message: responseData.erro?.mensagem || 'Erro ao criar exemplar',
                    tipo: 'erro',
                    erros: validationErrors
                });
                return;
            }

            sessionStorage.setItem(
                'successMessage',
                'Exemplar criado com sucesso!'
            );

            router.push("/midias");
        } catch (error) {
            console.error("Error creating exemplar:", error);
            setAlert({
                show: true,
                message: 'Erro ao criar exemplar. Verifique o console para mais detalhes.',
                tipo: 'erro'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-1/4 mx-auto">
            <h1 className="text-3xl text-center font-bold mt-6 mb-5">
                Criar Novo Exemplar
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
                    <ExemplarForm
                        idMidia={id as string}
                        onSubmit={handleCreateExemplar}
                        isSubmitting={isSubmitting}
                    />
                </CardContent>
            </Card>
        </div>
    );
}

