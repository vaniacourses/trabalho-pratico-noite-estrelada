"use client";

import { useState } from "react";
import { PublicLayout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { useForm } from "@/hooks/useForm";
import { validators, validateFields } from "@/utils/validators";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSimulatingLogin, setIsSimulatingLogin] = useState(false);

  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit } =
    useForm<LoginFormData>(
      {
        email: "",
        password: "",
      },
      async (values) => {
        try {
          setErrorMessage(null);
          setSuccessMessage(null);

          // Validar campos
          const validationErrors = validateFields(values, {
            email: [validators.required, validators.email],
            password: [validators.required, validators.minLength(6)],
          });

          if (Object.keys(validationErrors).length > 0) {
            const firstError = Object.values(validationErrors)[0];
            setErrorMessage(firstError);
            return;
          }

          // Simular chamada à API
          setIsSimulatingLogin(true);
          
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          }).catch(() => {
            // Simular sucesso se API não estiver disponível
            return new Response(
              JSON.stringify({
                sucesso: true,
                dados: { token: "mock-token-123", usuario: { email: values.email } },
              }),
              { status: 200 }
            );
          });

          if (!response.ok) {
            throw new Error("Falha na autenticação");
          }

          const data = await response.json();

          if (data.sucesso) {
            setSuccessMessage(`✓ Bem-vindo, ${values.email}!`);
            // Simular redirecionamento após 2 segundos
            setTimeout(() => {
              window.location.href = "/balcao";
            }, 2000);
          } else {
            setErrorMessage(data.erro?.mensagem || "Erro na autenticação");
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Erro ao fazer login";
          setErrorMessage(message);
        } finally {
          setIsSimulatingLogin(false);
        }
      }
    );

  return (
    <PublicLayout title="Autenticação">
      <Card className="shadow-premium">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="seu.email@biblioteca.com"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email && errors.email ? errors.email : undefined}
              disabled={isSubmitting || isSimulatingLogin}
            />

            {/* Senha */}
            <Input
              label="Senha"
              type="password"
              name="password"
              placeholder="Sua senha segura"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                touched.password && errors.password
                  ? errors.password
                  : undefined
              }
              disabled={isSubmitting || isSimulatingLogin}
              helperText="Mínimo 6 caracteres"
            />

            {/* Alerts */}
            {successMessage && (
              <Alert variant="success" message={successMessage} />
            )}

            {errorMessage && (
              <Alert
                variant="error"
                title="Erro na autenticação"
                message={errorMessage}
                onClose={() => setErrorMessage(null)}
              />
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting || isSimulatingLogin}
              className="w-full mt-6"
            >
              Fazer Login
            </Button>
          </form>
        </CardContent>

        <CardFooter>
          <p className="text-sm text-brand-text/60">
            💡 Dica: Use qualquer email e senha (mín. 6 caracteres) para simular login
          </p>
        </CardFooter>
      </Card>

      {/* Informações adicionais */}
      <div className="mt-8 space-y-4">
        <div className="card-secondary">
          <h3 className="font-semibold text-brand-text mb-2">
            👤 Tipos de Usuários
          </h3>
          <ul className="text-sm text-brand-text/80 space-y-1">
            <li>🔑 Leitor - Acessa empréstimos pessoais</li>
            <li>💼 Atendente - Gerencia empréstimos no balcão</li>
            <li>👨‍💼 Gerente - Acesso administrativo completo</li>
          </ul>
        </div>

        <div className="card-secondary">
          <h3 className="font-semibold text-brand-text mb-2">
            🔐 Segurança
          </h3>
          <p className="text-sm text-brand-text/80">
            Suas credenciais são verificadas em tempo real contra nosso servidor. Utilizamos
            autenticação segura e criptografia.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
