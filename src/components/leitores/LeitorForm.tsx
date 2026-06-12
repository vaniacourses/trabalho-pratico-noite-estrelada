"use client"

import {useState} from "react";
import {Input} from "@/components/ui/Input.tsx";
import {Button} from "@/components/ui/Button.tsx";
import {Leitor} from "@prisma/client";
import Link from "next/link";
import {CardFooter} from "@/components/ui/Card.tsx";

interface LeitorFormProps {
    initialData?: Leitor;
    formMode: "create" | "edit";
    onSubmit: (data: Omit<Leitor, "id" | "estado" | "dataCriacao" | "dataAtualizacao">) => void;
    isSubmitting: boolean;
}

export function LeitorForm({initialData, formMode, onSubmit, isSubmitting}: LeitorFormProps) {

    const formatCPF = (value: string) => {

        const onlyNumbers = value.replace(/\D/g, "");

        if (onlyNumbers.length <= 3) {
            return onlyNumbers;
        } else if (onlyNumbers.length <= 6) {
            return `${onlyNumbers.slice(0, 3)}.${onlyNumbers.slice(3)}`;
        } else if (onlyNumbers.length <= 9) {
            return `${onlyNumbers.slice(0, 3)}.${onlyNumbers.slice(3, 6)}.${onlyNumbers.slice(6)}`;
        } else {
            return `${onlyNumbers.slice(0, 3)}.${onlyNumbers.slice(3, 6)}.${onlyNumbers.slice(6, 9)}-${onlyNumbers.slice(9, 11)}`;
        }
    };

    const [nome, setNome] = useState(initialData?.nome || "");
    const [cpf, setCpf] = useState(formatCPF(initialData?.cpf ?? ""));
    const [dataDeNascimento, setDataDeNascimento] = useState(
        initialData?.dataDeNascimento ? new Date(initialData.dataDeNascimento).toISOString().split("T")[0] : ""
    );
    const [email, setEmail] = useState(initialData?.email || "");
    const [senha, setSenha] = useState("");
    const [senhaConfirm, setSenhaConfirm] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCPF(e.target.value);
        setCpf(formatted);
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!nome.trim()) {
            newErrors.nome = "Nome é obrigatório";
        }

        if (formMode === "create") {

            if (!senha) {
                newErrors.senha = "Senha é obrigatória";
            } else if (senha !== senhaConfirm) {
                newErrors.senhaConfirm = "As senhas não coincidem";
            }
        }

        // CPF formatado tem 14 chars (xxx.xxx.xxx-xx); validação em ambos os modos (create e edit)
        if (cpf.length !== 0 && cpf.length < 14) {
            newErrors.cpf = "O cpf precisa estar no formato xxx.xxx.xxx-xx";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        onSubmit({
            nome,
            cpf: cpf.replace(/\D/g, ""),
            dataDeNascimento: dataDeNascimento ? new Date(dataDeNascimento) : null,
            email,
            senha,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                    Nome *
                </label>
                <Input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                />
                {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
            </div>
            {formMode === "create" && (
                <>
                    <div>
                        <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
                            Senha *
                        </label>
                        <Input
                            id="senha"
                            type="password"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}/>
                        {errors.senha && <p className="text-red-500 text-sm mt-1">{errors.senha}</p>}
                    </div>
                    <div>
                        <label htmlFor="senhaConfirm" className="block text-sm font-medium text-gray-700">
                            Confirmar Senha *
                        </label>
                        <Input
                            id="senhaConfirm"
                            type="password"
                            value={senhaConfirm}
                            onChange={(e) => setSenhaConfirm(e.target.value)}/>
                        {errors.senhaConfirm && <p className="text-red-500 text-sm mt-1">{errors.senhaConfirm}</p>}
                    </div>
                </>
            )}
            <div>
                <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">
                    CPF
                </label>
                <Input
                    id="cpf"
                    type="text"
                    value={cpf}
                    onChange={handleCPFChange}
                    maxLength={14}
                    placeholder="000.000.000-00"
                />
                {errors.cpf && <p className="text-red-500 text-sm mt-1">{errors.cpf}</p>}
            </div>
            <div>
                <label htmlFor="dataDeNascimento" className="block text-sm font-medium text-gray-700">
                    Data de Nascimento
                </label>
                <Input
                    id="dataDeNascimento"
                    type="date"
                    value={dataDeNascimento}
                    onChange={(e) => setDataDeNascimento(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                </label>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className={"flex justify-around mx-auto"}>
                <Button type="submit" disabled={isSubmitting} className={"btn btn-edit mt-3 w-3/4"}>
                    {isSubmitting ? "Salvando..." : "Salvar"}
                </Button>
            </div>
            <CardFooter>
                <Link href={"/leitores"} className={"btn btn-delete ml-2"}>
                    {"Voltar"}
                </Link>
            </CardFooter>
        </form>
    );
}