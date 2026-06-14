"use client"

import {useState, useEffect} from "react";
import {useParams, useRouter} from "next/navigation";
import {EstadoExemplar} from "@prisma/client";
import {AuthenticatedLayout} from "@/components/layout/Layout";
import {Card, CardHeader, CardTitle, CardContent, CardFooter} from "@/components/ui/Card.tsx";
import {Input} from "@/components/ui/Input.tsx";
import {Button} from "@/components/ui/Button.tsx";
import {Alert} from "@/components/ui/Alert.tsx";
import {exemplarStateTranslate} from "@/domain/translation.ts";

interface AlertState {
    show: boolean;
    message: string;
    tipo: 'sucesso' | 'erro';
}

const ESTADOS: EstadoExemplar[] = ["DISPONIVEL", "EMPRESTADO", "RESERVADO", "AFASTADO"];

export default function EditExemplarPage() {
    const {id, exemplarId} = useParams();
    const router = useRouter();

    const [codigo, setCodigo] = useState("");
    const [estado, setEstado] = useState<EstadoExemplar>("DISPONIVEL");
    const [fieldError, setFieldError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alert, setAlert] = useState<AlertState>({show: false, message: '', tipo: 'sucesso'});

    useEffect(() => {
        const fetchExemplar = async () => {
            try {
                setIsLoading(true);
                const r = await fetch(`/api/midias/${id}/exemplares/${exemplarId}`);
                const data = await r.json();
                if (r.ok) {
                    setCodigo(data.dados.codigo ?? "");
                    setEstado(data.dados.estado ?? "DISPONIVEL");
                } else {
                    setAlert({show: true, message: data.erro?.mensagem || 'Erro ao carregar exemplar', tipo: 'erro'});
                }
            } catch (e: any) {
                setAlert({show: true, message: e.message || 'Erro ao carregar exemplar', tipo: 'erro'});
            } finally {
                setIsLoading(false);
            }
        };
        fetchExemplar();
    }, [id, exemplarId]);

    const validate = () => {
        if (!codigo.trim()) {
            setFieldError("Código do exemplar é obrigatório");
            return false;
        }
        if (codigo.trim().length < 3) {
            setFieldError("Código do exemplar deve ter no mínimo 3 caracteres");
            return false;
        }
        setFieldError("");
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        setAlert({show: false, message: '', tipo: 'sucesso'});

        try {
            const response = await fetch(`/api/midias/${id}/exemplares/${exemplarId}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({codigo: codigo.trim(), estado}),
            });

            const data = await response.json();

            if (!response.ok) {
                const erros = data.erro?.erros;
                const firstError = erros ? Object.values(erros)[0] as string : data.erro?.mensagem;
                setAlert({show: true, message: firstError || 'Erro ao atualizar exemplar', tipo: 'erro'});
                return;
            }

            sessionStorage.setItem('successMessage', 'Exemplar atualizado com sucesso!');
            router.push(`/midias/${id}/exemplares`);
        } catch {
            setAlert({show: true, message: 'Erro ao conectar com o servidor.', tipo: 'erro'});
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <AuthenticatedLayout title="Editar Exemplar">
                <div className="flex justify-center items-center py-20 text-brand-secondary">
                    Carregando...
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout title="Editar Exemplar" subtitle="Atualize os dados do exemplar">
            <button
                onClick={() => router.push(`/midias/${id}/exemplares`)}
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
                            <CardTitle>Dados do Exemplar</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <Input
                                    label="Código do Exemplar"
                                    type="text"
                                    value={codigo}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCodigo(e.target.value)}
                                    placeholder="Ex: LIVRO-2024-001, CD-001..."
                                    error={fieldError}
                                    disabled={isSubmitting}
                                />

                                <div>
                                    <label htmlFor="estado" className="block text-sm font-semibold text-brand-text mb-2">
                                        Estado
                                    </label>
                                    <select
                                        id="estado"
                                        value={estado}
                                        onChange={(e) => setEstado(e.target.value as EstadoExemplar)}
                                        disabled={isSubmitting}
                                        className="input-field"
                                    >
                                        {ESTADOS.map((est) => (
                                            <option key={est} value={est}>
                                                {exemplarStateTranslate[est]}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={isSubmitting}
                                    className="w-full"
                                >
                                    Salvar Alterações
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push(`/midias/${id}/exemplares`)}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                        </CardFooter>
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
                                <p>Altere o <strong className="text-brand-text">código</strong> ou o <strong className="text-brand-text">estado</strong> do exemplar e clique em Salvar.</p>
                                <p>O código deve ter no mínimo 3 caracteres e ser único no sistema.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
