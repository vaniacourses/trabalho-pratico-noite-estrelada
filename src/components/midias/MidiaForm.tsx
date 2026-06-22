"use client"

import {useState, useEffect} from "react";
import {Midia} from "@prisma/client";
import {TipoDeMidia} from "@prisma/client";
import Link from "next/link";
import {Input} from "@/components/ui/Input.tsx";
import {mediaTranslate} from "@/domain/translation.ts";
import {Button} from "@/components/ui/Button.tsx";
import {CardFooter} from "@/components/ui/Card.tsx";


interface MidiaFormProps {
    initialData?: Midia;
    formMode: "create" | "edit";
    onSubmit: (data: Omit<Midia, "id" | "dataCriacao" | "exemplares" | "reservas">) => void;
    isSubmitting: boolean;
}

function defaultDadosFor(tipo: TipoDeMidia) {
    switch (tipo) {
        case "CD":
            return {artista: "", faixas: "", duracao: ""};
        case "DVD":
            return {diretor: "", codigoDeRegiao: "", legendas: "", duracao: ""};
        case "PUBLICACAO":
        default:
            return {autor: "", isbn: "", paginas: ""};
    }
}

export function MidiaForm({initialData, formMode, onSubmit, isSubmitting}: MidiaFormProps) {

    const initialTipo = (initialData?.tipo as TipoDeMidia) ?? (formMode === "create" ? "PUBLICACAO" as TipoDeMidia : "PUBLICACAO" as TipoDeMidia);

    const [titulo, setTitulo] = useState<string>(initialData?.titulo || "");
    const [tipo, setTipo] = useState<TipoDeMidia>(initialTipo);
    const [dados, setDados] = useState<any>(initialData?.dados ?? defaultDadosFor(initialTipo));
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Reset dados to clean defaults when the type changes on create (avoids stale fields leaking)
    useEffect(() => {
        if (!initialData) {
            setDados(defaultDadosFor(tipo));
        }
    }, [tipo, initialData]);

    function validateAndBuild(): { valid: boolean; payload?: any } {
        const newErrors: { [k: string]: string } = {};

        if (!titulo || titulo.trim() === "") {
            newErrors.titulo = "Título é obrigatório";
        }

        let payloadDados: any = {};

        if (tipo === "PUBLICACAO") {
            const autor = (dados.autor || "").toString().trim();
            const isbn = (dados.isbn || "").toString().trim();
            const paginasRaw = (dados.paginas || "").toString().trim();

            if (!autor) newErrors.autor = "Autor é obrigatório";
            if (!isbn) newErrors.isbn = "ISBN é obrigatório";
            if (!paginasRaw) newErrors.paginas = "Páginas é obrigatório";

            const paginas = Number(paginasRaw);
            if (isNaN(paginas) || paginas <= 0) newErrors.paginas = "Páginas deve ser um número maior que 0";

            payloadDados = {autor, isbn, paginas};
        }

        if (tipo === "CD") {
            const artista = (dados.artista || "").toString().trim();
            const faixasRaw = (dados.faixas || "").toString().trim();
            const duracaoRaw = (dados.duracao || "").toString().trim();

            if (!artista) newErrors.artista = "Artista é obrigatório";
            if (!faixasRaw) newErrors.faixas = "Faixas é obrigatório (separe por vírgula)";
            if (!duracaoRaw) newErrors.duracao = "Duração é obrigatória";

            const duracao = Number(duracaoRaw);
            if (isNaN(duracao) || duracao <= 0) newErrors.duracao = "Duração deve ser um número maior que 0";

            const faixas = faixasRaw.split(",").map((s: any) => s.trim()).filter(Boolean);
            if (faixas.length === 0) newErrors.faixas = "Informe ao menos uma faixa";

            payloadDados = {artista, faixas, duracao};
        }

        if (tipo === "DVD") {
            const diretor = (dados.diretor || "").toString().trim();
            const codigoDeRegiao = (dados.codigoDeRegiao || "").toString().trim();
            const legendasRaw = (dados.legendas || "").toString().trim();
            const duracaoRaw = (dados.duracao || "").toString().trim();

            if (!diretor) newErrors.diretor = "Diretor é obrigatório";
            if (!codigoDeRegiao) newErrors.codigoDeRegiao = "Código de região é obrigatório";
            if (!legendasRaw) newErrors.legendas = "Legendas é obrigatório (separe por vírgula)";
            if (!duracaoRaw) newErrors.duracao = "Duração é obrigatória";

            const duracao = Number(duracaoRaw);
            if (isNaN(duracao) || duracao <= 0) newErrors.duracao = "Duração deve ser um número maior que 0";

            const legendas = legendasRaw.split(",").map((s: any) => s.trim()).filter(Boolean);
            if (legendas.length === 0) newErrors.legendas = "Informe ao menos uma legenda";

            payloadDados = {diretor, codigoDeRegiao, legendas, duracao};
        }

        setErrors(newErrors);

        return {
            valid: Object.keys(newErrors).length === 0,
            payload: {titulo: titulo.trim(), tipo, dados: payloadDados}
        };
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const {valid, payload} = validateAndBuild();
        if (!valid) return;

        onSubmit(payload as any);
    };

    function renderDataFields() {
        switch (tipo) {
            case "PUBLICACAO":
                return (
                    <div className="space-y-5">
                        <div>
                            <label htmlFor="autor" className="block text-sm font-semibold text-brand-text mb-2">Autor *</label>
                            <Input id="autor" type="text" value={dados.autor || ""}
                                   onChange={(e: any) => setDados({...dados, autor: e.target.value})}
                                   error={errors.autor}/>
                        </div>

                        <div>
                            <label htmlFor="isbn" className="block text-sm font-semibold text-brand-text mb-2">ISBN *</label>
                            <Input id="isbn" type="text" value={dados.isbn || ""}
                                   onChange={(e: any) => setDados({...dados, isbn: e.target.value})}
                                   error={errors.isbn}/>
                        </div>

                        <div>
                            <label htmlFor="paginas" className="block text-sm font-semibold text-brand-text mb-2">Páginas *</label>
                            <Input id="paginas" type="number" value={dados.paginas || ""}
                                   onChange={(e: any) => setDados({...dados, paginas: e.target.value})}
                                   error={errors.paginas}/>
                        </div>
                    </div>
                );

            case "CD":
                return (
                    <div className="space-y-5">
                        <div>
                            <label htmlFor="artista" className="block text-sm font-semibold text-brand-text mb-2">Artista *</label>
                            <Input id="artista" type="text" value={dados.artista || ""}
                                   onChange={(e: any) => setDados({...dados, artista: e.target.value})}
                                   error={errors.artista}/>
                        </div>

                        <div>
                            <label htmlFor="faixas" className="block text-sm font-semibold text-brand-text mb-2">Faixas * <span
                                className="text-xs font-normal text-brand-secondary">(coloque no formato faixa:duracao,...)</span></label>
                            <Input id="faixas" type="text" value={dados.faixas || ""}
                                   onChange={(e: any) => setDados({...dados, faixas: e.target.value})}
                                   error={errors.faixas}/>
                        </div>

                        <div>
                            <label htmlFor="duracao" className="block text-sm font-semibold text-brand-text mb-2">Duração (minutos) *</label>
                            <Input id="duracao" type="number" value={dados.duracao || ""}
                                   onChange={(e: any) => setDados({...dados, duracao: e.target.value})}
                                   error={errors.duracao}/>
                        </div>
                    </div>
                );

            case "DVD":
                return (
                    <div className="space-y-5">
                        <div>
                            <label htmlFor="diretor" className="block text-sm font-semibold text-brand-text mb-2">Diretor *</label>
                            <Input id="diretor" type="text" value={dados.diretor || ""}
                                   onChange={(e: any) => setDados({...dados, diretor: e.target.value})}
                                   error={errors.diretor}/>
                        </div>

                        <div>
                            <label htmlFor="codigoDeRegiao" className="block text-sm font-semibold text-brand-text mb-2">Código de Região *</label>
                            <Input id="codigoDeRegiao" type="text" value={dados.codigoDeRegiao || ""}
                                   onChange={(e: any) => setDados({...dados, codigoDeRegiao: e.target.value})}
                                   error={errors.codigoDeRegiao}/>
                        </div>

                        <div>
                            <label htmlFor="legendas" className="block text-sm font-semibold text-brand-text mb-2">Legendas * <span
                                className="text-xs font-normal text-brand-secondary">(separe por vírgula)</span></label>
                            <Input id="legendas" type="text" value={dados.legendas || ""}
                                   onChange={(e: any) => setDados({...dados, legendas: e.target.value})}
                                   error={errors.legendas}/>
                        </div>

                        <div>
                            <label htmlFor="duracao" className="block text-sm font-semibold text-brand-text mb-2">Duração (minutos) *</label>
                            <Input id="duracao" type="number" value={dados.duracao || ""}
                                   onChange={(e: any) => setDados({...dados, duracao: e.target.value})}
                                   error={errors.duracao}/>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label htmlFor="titulo" className="block text-sm font-semibold text-brand-text mb-2">Título *</label>
                <Input id="titulo" type="text" value={titulo} onChange={(e: any) => setTitulo(e.target.value)}
                       error={errors.titulo}/>
            </div>

            {formMode === "create" ? (
                <div>
                    <label htmlFor="tipo" className="block text-sm font-semibold text-brand-text mb-2">Tipo</label>
                    <select id="tipo" value={tipo} onChange={(e: any) => setTipo(e.target.value as TipoDeMidia)}
                            className="input-field">
                        <option value="PUBLICACAO">Publicação</option>
                        <option value="CD">CD</option>
                        <option value="DVD">DVD</option>
                    </select>
                </div>
            ) : (
                <div>
                    <label className="block text-sm font-semibold text-brand-text mb-2">Tipo</label>
                    <input type="text" readOnly value={mediaTranslate[tipo]}
                           className="input-field bg-brand-bg text-brand-secondary cursor-not-allowed"/>
                </div>
            )}

            {renderDataFields()}

            <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>

            <CardFooter>
                <Link href={formMode === "create" ? "/midias" : `/midias/${initialData?.id}`}>
                    <Button type="button" variant="outline">Voltar</Button>
                </Link>
            </CardFooter>
        </form>
    );
}
