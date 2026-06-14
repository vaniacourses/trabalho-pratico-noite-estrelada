"use client"

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {MidiaForm} from "@/components/midias/MidiaForm.tsx";
import {Midia} from "@prisma/client";
import {AuthenticatedLayout} from "@/components/layout/Layout";
import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/Card.tsx";
import {Alert} from "@/components/ui/Alert.tsx";

interface AlertState {
    show: boolean;
    message: string;
    tipo: 'sucesso' | 'erro';
    erros?: Record<string, string>;
}

export default function EditMidiaPage() {
    const {id} = useParams()
    const router = useRouter();
    const [midia, setMidia] = useState<any>(null)
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alert, setAlert] = useState<AlertState>({show: false, message: '', tipo: 'sucesso'});

    useEffect(() => {
        fetch(`/api/midias/${id}`)
            .then((r) => r.json())
            .then(setMidia);
    }, [id]);

    const handleUpdateMidia = async (
        data: Omit<Midia, "id" | "estado" | "dataCriacao" | "emprestimos" | "reservas">
    ) => {
        setIsSubmitting(true);
        setAlert({show: false, message: '', tipo: 'sucesso'});

        try {
            const response = await fetch(`/api/midias/${id}/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();

            if (!response.ok) {
                const validationErrors = responseData.erro?.erros;
                const firstError = validationErrors
                    ? Object.values(validationErrors)[0] as string
                    : responseData.erro?.mensagem;
                setAlert({
                    show: true,
                    message: firstError || 'Erro ao atualizar mídia',
                    tipo: 'erro',
                    erros: validationErrors
                });
                return;
            }

            sessionStorage.setItem(
                'successMessage',
                'Mídia atualizada com sucesso!'
            );

            router.push(`/midias/${id}`);
        } catch (error) {
            console.error("Error updating midia:", error);
            setAlert({
                show: true,
                message: 'Erro ao atualizar mídia. Verifique o console para mais detalhes.',
                tipo: 'erro'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!midia) {
        return (
            <AuthenticatedLayout title="Atualizar Mídia">
                <div className="flex justify-center items-center py-20 text-brand-secondary">
                    Carregando...
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout title="Atualizar Mídia" subtitle="Edite as informações da mídia">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-1 mb-4 text-sm text-brand-secondary hover:text-brand-text transition-colors"
            >
                ← Voltar
            </button>

            {alert.show && (
                <div className="mb-6">
                    <Alert
                        variant={alert.tipo === 'sucesso' ? 'success' : 'error'}
                        message={alert.message}
                        onClose={() => setAlert(prev => ({...prev, show: false}))}
                    />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Formulário */}
                <div className="lg:col-span-2">
                    <Card className="shadow-premium">
                        <CardHeader>
                            <CardTitle>Dados da Mídia</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <MidiaForm
                                initialData={midia.dados}
                                formMode={"edit"}
                                onSubmit={handleUpdateMidia}
                                isSubmitting={isSubmitting}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Informações */}
                <div>
                    <Card variant="secondary">
                        <CardHeader>
                            <CardTitle>
                                <span className="text-xl">Sobre a edição</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 text-sm text-brand-text/70">
                                <p>Altere os campos desejados e clique em <strong className="text-brand-text">Salvar</strong> para confirmar.</p>
                                <p>O <strong className="text-brand-text">tipo</strong> da mídia não pode ser alterado após a criação.</p>
                                <p>Campos marcados com <strong className="text-brand-text">*</strong> são obrigatórios.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
