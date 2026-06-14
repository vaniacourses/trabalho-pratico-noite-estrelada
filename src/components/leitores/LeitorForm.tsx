"use client"

import {useState} from "react";
import {Input} from "@/components/ui/Input.tsx";
import {Button} from "@/components/ui/Button.tsx";
import {Leitor} from "@prisma/client";
import Link from "next/link";
import {CardFooter} from "@/components/ui/Card.tsx";
import {formatCpf, normalizarCpf} from "@/utils/helpers";

interface LeitorFormProps {
    initialData?: Leitor;
    formMode: "create" | "edit";
    onSubmit: (data: Omit<Leitor, "id" | "estado" | "dataCriacao" | "dataAtualizacao" | "emprestimos" | "reservas">) => void;
    isSubmitting: boolean;
    backHref?: string;
}

export function LeitorForm({initialData, formMode, onSubmit, isSubmitting, backHref = "/leitores"}: LeitorFormProps) {

    const [nome, setNome] = useState(initialData?.nome || "");
    const [cpf, setCpf] = useState(formatCpf(initialData?.cpf ?? ""));
    const [dataDeNascimento, setDataDeNascimento] = useState(
        initialData?.dataDeNascimento ? new Date(initialData.dataDeNascimento).toISOString().split("T")[0] : ""
    );
    const [email, setEmail] = useState(initialData?.email || "");
    const [senha, setSenha] = useState("");
    const [senhaConfirm, setSenhaConfirm] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCpf(formatCpf(e.target.value));
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
            } else if (senha.length < 6) {
                newErrors.senha = "A senha precisa de pelo menos 6 caracteres";
            }

            if(!email.trim()){
                newErrors.email = "Email é obrigatório";
            }

            const cpfDigitos = normalizarCpf(cpf);
            if (cpfDigitos.length !== 0 && cpfDigitos.length < 11) {
                newErrors.cpf = "O cpf precisa estar no formato xxx.xxx.xxx-xx";
            }
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
            cpf: normalizarCpf(cpf),
            dataDeNascimento: dataDeNascimento ? new Date(dataDeNascimento) : null,
            email,
            senha,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label htmlFor="nome" className="block text-sm font-semibold text-brand-text mb-2">
                    Nome *
                </label>
                <Input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    error={errors.nome}
                />
            </div>
            {formMode === "create" && (
                <>
                    <div>
                        <label htmlFor="senha" className="block text-sm font-semibold text-brand-text mb-2">
                            Senha *
                        </label>
                        <Input
                            id="senha"
                            type="password"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            error={errors.senha}
                        />
                    </div>
                    <div>
                        <label htmlFor="senhaConfirm" className="block text-sm font-semibold text-brand-text mb-2">
                            Confirmar Senha *
                        </label>
                        <Input
                            id="senhaConfirm"
                            type="password"
                            value={senhaConfirm}
                            onChange={(e) => setSenhaConfirm(e.target.value)}
                            error={errors.senhaConfirm}
                        />
                    </div>
                </>
            )}
            <div>
                <label htmlFor="cpf" className="block text-sm font-semibold text-brand-text mb-2">
                    CPF
                </label>
                <Input
                    id="cpf"
                    type="text"
                    value={cpf}
                    onChange={handleCPFChange}
                    maxLength={14}
                    placeholder="000.000.000-00"
                    error={errors.cpf}
                />
            </div>
            <div>
                <label htmlFor="dataDeNascimento" className="block text-sm font-semibold text-brand-text mb-2">
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
                <label htmlFor="email" className="block text-sm font-semibold text-brand-text mb-2">
                    Email *
                </label>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                />
            </div>

            <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>

            <CardFooter>
                <Link href={backHref}>
                    <Button type="button" variant="outline">Voltar</Button>
                </Link>
            </CardFooter>
        </form>
    );
}