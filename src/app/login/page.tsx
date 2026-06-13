"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PublicLayout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { validators, validateFields } from "@/utils/validators";

const TIPOS_FUNCIONARIO = ["ATENDENTE", "GERENTE"];

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const contexto = searchParams.get("contexto") ?? "leitor";
  const redirectParam = searchParams.get("redirect");
  const isFuncionario = contexto === "funcionario";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pré-compila as rotas destino para evitar Fast Refresh no redirect
  useEffect(() => {
    router.prefetch("/portal");
    router.prefetch("/balcao");
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const validationErrors = validateFields(
      { email, password },
      {
        email: [validators.required, validators.email],
        password: [validators.required, validators.minLength(6)],
      }
    );

    if (Object.keys(validationErrors).length > 0) {
      setErrorMessage(Object.values(validationErrors)[0]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.sucesso) {
        setErrorMessage(data.erro?.mensagem || "Email ou senha inválidos");
        return;
      }

      const usuario = data.dados.usuario;

      if (isFuncionario && !TIPOS_FUNCIONARIO.includes(usuario.tipo)) {
        setErrorMessage("Acesso negado. Esta entrada é exclusiva para Atendentes e Gerentes.");
        return;
      }
      if (!isFuncionario && TIPOS_FUNCIONARIO.includes(usuario.tipo)) {
        setErrorMessage("Acesso negado. Funcionários devem usar o acesso de Atendimento.");
        return;
      }

      localStorage.setItem("usuario", JSON.stringify(usuario));
      setSuccessMessage(`Bem-vindo, ${usuario.nome}!`);

      const destino = redirectParam ?? (isFuncionario ? "/balcao" : "/portal");
      setTimeout(() => {
        router.replace(destino);
      }, 800);
    } catch {
      setErrorMessage("Erro ao conectar com o servidor");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <PublicLayout title={isFuncionario ? "Acesso de Funcionários" : "Acesso do Leitor"}>
      <Card className="shadow-premium">
        <CardContent>
          <div className="mb-4 text-center">
            <span className="text-3xl">{isFuncionario ? "💼" : "📚"}</span>
            <h2 className="text-lg font-semibold text-brand-text mt-1">
              {isFuncionario ? "Atendentes e Gerentes" : "Área do Leitor"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="seu.email@biblioteca.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              disabled={isLoading}
            />

            <Input
              label="Senha"
              type="password"
              name="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              disabled={isLoading}
              helperText="Mínimo 6 caracteres"
            />

            {successMessage && <Alert variant="success" message={successMessage} />}
            {errorMessage && (
              <Alert
                variant="error"
                title="Erro na autenticação"
                message={errorMessage}
                onClose={() => setErrorMessage(null)}
              />
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              className="w-full mt-6"
            >
              Entrar
            </Button>
          </form>
        </CardContent>

        <CardFooter>
          <a href="/" className="text-sm text-brand-secondary hover:underline">
            ← Voltar ao início
          </a>
        </CardFooter>
      </Card>
    </PublicLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
