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
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pré-compila as rotas destino para evitar Fast Refresh no redirect
  useEffect(() => {
    router.prefetch("/portal");
    router.prefetch("/balcao");
  }, [router]);

  // Exibe mensagem vinda de outra tela (ex.: após cadastro)
  useEffect(() => {
    const message = sessionStorage.getItem("successMessage");
    if (message) {
      setSuccessMessage(message);
      sessionStorage.removeItem("successMessage");
    }
  }, []);

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
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              disabled={isLoading}
              helperText="Mínimo 6 caracteres"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="text-brand-secondary hover:text-brand-text transition-colors"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              }
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

          {!isFuncionario && (
            <div className="mt-6 text-center text-sm text-brand-secondary">
              Ainda não tem cadastro?{" "}
              <a
                href="/leitores/create?from=login"
                className="font-semibold text-brand-primary hover:underline"
              >
                Cadastrar novo leitor
              </a>
            </div>
          )}
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
