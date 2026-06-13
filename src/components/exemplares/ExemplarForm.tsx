"use client"

import {useState} from "react";
import Link from "next/link";
import {Input} from "@/components/ui/Input.tsx";
import {Button} from "@/components/ui/Button.tsx";
import {CardFooter} from "@/components/ui/Card.tsx";

interface ExemplarFormProps {
    idMidia: string;
    onSubmit: (data: { idMidia: string; codigo: string }) => void;
    isSubmitting: boolean;
}

export function ExemplarForm({idMidia, onSubmit, isSubmitting}: ExemplarFormProps) {
    const [codigo, setCodigo] = useState<string>("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    function validateAndBuild(): { valid: boolean; payload?: any } {
        const newErrors: { [k: string]: string } = {};

        if (!codigo || codigo.trim() === "") {
            newErrors.codigo = "Código do exemplar é obrigatório";
        }

        if (codigo && codigo.trim().length < 3) {
            newErrors.codigo = "Código do exemplar deve ter no mínimo 3 caracteres";
        }

        setErrors(newErrors);

        return {
            valid: Object.keys(newErrors).length === 0,
            payload: {idMidia, codigo: codigo.trim()}
        };
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const {valid, payload} = validateAndBuild();
        if (!valid) return;

        onSubmit(payload as any);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="codigo" className="block text-sm font-medium text-gray-700">
                    Código do Exemplar *
                </label>
                <Input
                    id="codigo"
                    type="text"
                    value={codigo}
                    onChange={(e: any) => setCodigo(e.target.value)}
                    placeholder="Ex: LIVRO-2024-001, CD-2024-001"
                />
                {errors.codigo && <p className="text-red-500 text-sm mt-1">{errors.codigo}</p>}
            </div>

            <div className={"flex justify-around mx-auto"}>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={"btn btn-edit mt-3 w-3/4"}
                >
                    {isSubmitting ? "Criando..." : "Criar Exemplar"}
                </Button>
            </div>

            <CardFooter>
                <Link href="/midias" className={"btn btn-delete ml-2"}>
                    Voltar
                </Link>
            </CardFooter>
        </form>
    );
}

