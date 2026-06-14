"use client"

import {useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {AuthenticatedLayout} from "@/components/layout/Layout";
import {Card, CardHeader, CardTitle, CardContent, CardFooter} from "@/components/ui/Card.tsx";
import {Input} from "@/components/ui/Input.tsx";
import {Button} from "@/components/ui/Button.tsx";
import {Alert} from "@/components/ui/Alert.tsx";

interface AlertState {
    show: boolean;
    message: string;
    tipo: 'sucesso' | 'erro';
    erros?: Record<string, string>;
}

export default function CreateExemplarPage() {
    const {id} = useParams();
    const router = useRouter();
    const [codigo, setCodigo] = useState("");
    const [fieldError, setFieldError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alert, setAlert] = useState<AlertState>({show: false, message: '', tipo: 'sucesso'});

    const validate = () => {
        if (!codigo.trim()) { setFieldError("Código do exemplar é obrigatório"); return false; }
        if (codigo.trim().length < 3) { setFieldError("Código do exemplar deve ter no mínimo 3 caracteres"); return false; }
        setFieldError("");
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        setAlert({show: false, message: '', tipo: 'sucesso'});

        try {
            const response = await fetch(`/api/midias/${id}/exemplares`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({idMidia: id, codigo: codigo.trim()}),
            });

            const data = await response.json();

            if (!response.ok) {
                const erros = data.erro?.erros;
                const firstError = erros ? Object.values(erros)[0] as string : data.erro?.mensagem;
                setAlert({show: true, message: firstError || 'Erro ao criar exemplar', tipo: 'erro', erros});
                return;
            }

            sessionStorage.setItem('successMessage', 'Exemplar criado com sucesso!');
            router.push(`/midias/${id}/exemplares`);
        } catch {
            setAlert({show: true, message: 'Erro ao conectar com o servidor.', tipo: 'erro'});
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthenticatedLayout title="Novo Exemplar" subtitle="Adicione um exemplar ao acervo">
            <div className="max-w-md">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1 mb-4 text-sm text-brand-secondary hover:text-brand-text transition-colors"
                >
                    ← Voltar
                </button>

                {alert.show && (
                    <div className="mb-4">
                        <Alert
                            variant={alert.tipo === 'sucesso' ? 'success' : 'error'}
                            message={alert.message}
                            onClose={() => setAlert(prev => ({...prev, show: false}))}
                        />
                    </div>
                )}

                <Card className="shadow-premium">
                    <CardHeader>
                        <CardTitle>
                            <span className="text-xl">Dados do Exemplar</span>
                        </CardTitle>
                        <p className="text-brand-secondary mt-1 text-sm">
                            Informe o código que identifica este exemplar físico no acervo.
                        </p>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <Input
                                    label="Código do Exemplar"
                                    type="text"
                                    value={codigo}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCodigo(e.target.value)}
                                    placeholder="Ex: LIVRO-2024-001, CD-001..."
                                    error={fieldError}
                                    disabled={isSubmitting}
                                />
                                <p className="mt-2 text-xs text-brand-secondary">
                                    Deve ter no mínimo 3 caracteres e ser único no sistema.
                                </p>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                loading={isSubmitting}
                                className="w-full"
                            >
                                Criar Exemplar
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter>
                        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                            Cancelar
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
