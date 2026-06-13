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
                    <div className="space-y-3">
                        <div>
                            <label htmlFor="autor" className="block text-sm font-medium text-gray-700">Autor *</label>
                            <Input id="autor" type="text" value={dados.autor || ""}
                                   onChange={(e: any) => setDados({...dados, autor: e.target.value})}/>
                            {errors.autor && <p className="text-red-500 text-sm mt-1">{errors.autor}</p>}
                        </div>

                        <div>
                            <label htmlFor="isbn" className="block text-sm font-medium text-gray-700">ISBN *</label>
                            <Input id="isbn" type="text" value={dados.isbn || ""}
                                   onChange={(e: any) => setDados({...dados, isbn: e.target.value})}/>
                            {errors.isbn && <p className="text-red-500 text-sm mt-1">{errors.isbn}</p>}
                        </div>

                        <div>
                            <label htmlFor="paginas" className="block text-sm font-medium text-gray-700">Páginas
                                *</label>
                            <Input id="paginas" type="number" value={dados.paginas || ""}
                                   onChange={(e: any) => setDados({...dados, paginas: e.target.value})}/>
                            {errors.paginas && <p className="text-red-500 text-sm mt-1">{errors.paginas}</p>}
                        </div>
                    </div>
                );

            case "CD":
                return (
                    <div className="space-y-3">
                        <div>
                            <label htmlFor="artista" className="block text-sm font-medium text-gray-700">Artista
                                *</label>
                            <Input id="artista" type="text" value={dados.artista || ""}
                                   onChange={(e: any) => setDados({...dados, artista: e.target.value})}/>
                            {errors.artista && <p className="text-red-500 text-sm mt-1">{errors.artista}</p>}
                        </div>

                        <div>
                            <label htmlFor="faixas" className="block text-sm font-medium text-gray-700">Faixas * <span
                                className="text-xs text-gray-500">(coloque no formato faixa:duracao,...)</span></label>
                            <Input id="faixas" type="text" value={dados.faixas || ""}
                                   onChange={(e: any) => setDados({...dados, faixas: e.target.value})}/>
                            {errors.faixas && <p className="text-red-500 text-sm mt-1">{errors.faixas}</p>}
                        </div>

                        <div>
                            <label htmlFor="duracao" className="block text-sm font-medium text-gray-700">Duração
                                (minutos) *</label>
                            <Input id="duracao" type="number" value={dados.duracao || ""}
                                   onChange={(e: any) => setDados({...dados, duracao: e.target.value})}/>
                            {errors.duracao && <p className="text-red-500 text-sm mt-1">{errors.duracao}</p>}
                        </div>
                    </div>
                );

            case "DVD":
                return (
                    <div className="space-y-3">
                        <div>
                            <label htmlFor="diretor" className="block text-sm font-medium text-gray-700">Diretor
                                *</label>
                            <Input id="diretor" type="text" value={dados.diretor || ""}
                                   onChange={(e: any) => setDados({...dados, diretor: e.target.value})}/>
                            {errors.diretor && <p className="text-red-500 text-sm mt-1">{errors.diretor}</p>}
                        </div>

                        <div>
                            <label htmlFor="codigoDeRegiao" className="block text-sm font-medium text-gray-700">Código
                                de Região *</label>
                            <Input id="codigoDeRegiao" type="text" value={dados.codigoDeRegiao || ""}
                                   onChange={(e: any) => setDados({...dados, codigoDeRegiao: e.target.value})}/>
                            {errors.codigoDeRegiao &&
                                <p className="text-red-500 text-sm mt-1">{errors.codigoDeRegiao}</p>}
                        </div>

                        <div>
                            <label htmlFor="legendas" className="block text-sm font-medium text-gray-700">Legendas
                                * <span className="text-xs text-gray-500">(separe por vírgula)</span></label>
                            <Input id="legendas" type="text" value={dados.legendas || ""}
                                   onChange={(e: any) => setDados({...dados, legendas: e.target.value})}/>
                            {errors.legendas && <p className="text-red-500 text-sm mt-1">{errors.legendas}</p>}
                        </div>

                        <div>
                            <label htmlFor="duracao" className="block text-sm font-medium text-gray-700">Duração
                                (minutos) *</label>
                            <Input id="duracao" type="number" value={dados.duracao || ""}
                                   onChange={(e: any) => setDados({...dados, duracao: e.target.value})}/>
                            {errors.duracao && <p className="text-red-500 text-sm mt-1">{errors.duracao}</p>}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">Título *</label>
                <Input id="titulo" type="text" value={titulo} onChange={(e: any) => setTitulo(e.target.value)}/>
                {errors.titulo && <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>}
            </div>

            {formMode === "create" ? (
                <div>
                    <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">Tipo</label>
                    <select id="tipo" value={tipo} onChange={(e: any) => setTipo(e.target.value as TipoDeMidia)}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3">
                        <option value="PUBLICACAO">Publicação</option>
                        <option value="CD">CD</option>
                        <option value="DVD">DVD</option>
                    </select>
                </div>
            ) : (
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                    <input type="text" readOnly value={mediaTranslate[tipo]}
                           className="mt-1 block w-full rounded-md p-3 border-gray-200 bg-gray-100 text-gray-700"/>
                </div>
            )}

            {renderDataFields()}

            <div className={"flex justify-around mx-auto"}>
                <Button type="submit" disabled={isSubmitting}
                        className={"btn btn-edit mt-3 w-3/4"}>{isSubmitting ? "Salvando..." : "Salvar"}</Button>
            </div>

            <CardFooter>
                <Link href={formMode === "create" ? "/midias" : `/midias/${initialData?.id}`}
                      className={"btn btn-delete ml-2"}>Voltar</Link>
            </CardFooter>
        </form>
    );
}
