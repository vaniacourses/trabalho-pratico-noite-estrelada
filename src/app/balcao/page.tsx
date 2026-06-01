"use client";

import { useState } from "react";
import { AuthenticatedLayout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useForm } from "@/hooks/useForm";
import { validators, validateFields } from "@/utils/validators";

interface EmprestimoFormData {
  idLeitor: string;
  idExemplar: string;
}

interface EmprestimoResponse {
  sucesso: boolean;
  dados?: {
    id: string;
    idLeitor: string;
    idExemplar: string;
    dataInicio: string;
    dataExpiracao: string;
    estado: string;
  };
  erro?: {
    codigo: string;
    mensagem: string;
  };
}

export default function BalcaoPage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emprestimoRealizado, setEmprestimoRealizado] =
    useState<EmprestimoResponse["dados"] | null>(null);

  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, reset } =
    useForm<EmprestimoFormData>(
      {
        idLeitor: "",
        idExemplar: "",
      },
      async (formValues) => {
        try {
          setErrorMessage(null);
          setSuccessMessage(null);
          setEmprestimoRealizado(null);

          // Validar campos
          const validationErrors = validateFields(formValues, {
            idLeitor: [validators.required],
            idExemplar: [validators.required],
          });

          if (Object.keys(validationErrors).length > 0) {
            const firstError = Object.values(validationErrors)[0];
            setErrorMessage(firstError);
            return;
          }

          // Fazer requisição POST à API
          const response = await fetch("/api/emprestimos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              idLeitor: formValues.idLeitor,
              idExemplar: formValues.idExemplar,
              diasEmprestimo: 14, // Padrão
            }),
          });

          const data: EmprestimoResponse = await response.json();

          if (!response.ok || !data.sucesso) {
            throw new Error(
              data.erro?.mensagem || "Erro ao realizar empréstimo"
            );
          }

          // Sucesso
          setEmprestimoRealizado(data.dados || null);
          setSuccessMessage("✓ Empréstimo realizado com sucesso!");
          reset();

          // Limpar mensagem após 5 segundos
          setTimeout(() => {
            setSuccessMessage(null);
            setEmprestimoRealizado(null);
          }, 5000);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Erro desconhecido";
          setErrorMessage(message);
          console.error("Erro ao realizar empréstimo:", error);
        }
      }
    );

  return (
    <AuthenticatedLayout
      title="Balcão de Atendimento"
      subtitle="Realize empréstimos de exemplares"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário Principal */}
        <div className="lg:col-span-2">
          <Card className="shadow-premium">
            <CardHeader>
              <CardTitle>Novo Empréstimo</CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* ID Leitor */}
                <Input
                  label="ID do Leitor"
                  name="idLeitor"
                  placeholder="Ex: clm9z1a2b3c4d5e6f7g8h"
                  value={values.idLeitor}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.idLeitor && errors.idLeitor
                      ? errors.idLeitor
                      : undefined
                  }
                  disabled={isSubmitting}
                  helperText="Copie o ID do leitor do Prisma Studio"
                />

                {/* ID Exemplar */}
                <Input
                  label="ID do Exemplar"
                  name="idExemplar"
                  placeholder="Ex: clm9z8h7g6f5e4d3c2b1a"
                  value={values.idExemplar}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.idExemplar && errors.idExemplar
                      ? errors.idExemplar
                      : undefined
                  }
                  disabled={isSubmitting}
                  helperText="Copie o ID do exemplar disponível"
                />

                {/* Alerts */}
                {successMessage && (
                  <Alert variant="success" message={successMessage} />
                )}

                {errorMessage && (
                  <Alert
                    variant="error"
                    title="Erro ao realizar empréstimo"
                    message={errorMessage}
                    onClose={() => setErrorMessage(null)}
                  />
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isSubmitting}
                  className="w-full"
                >
                  Realizar Empréstimo
                </Button>
              </form>
            </CardContent>

            <CardFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset();
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
              >
                Limpar
              </Button>
            </CardFooter>
          </Card>

          {/* Info Box */}
          <div className="mt-6 card-secondary">
            <h3 className="font-semibold text-brand-text mb-3">
              📋 Como realizar um empréstimo
            </h3>
            <ol className="text-sm text-brand-text/80 space-y-2 list-decimal list-inside">
              <li>Abra o Prisma Studio: <code className="bg-white px-2 py-1 rounded text-xs">npx prisma studio</code></li>
              <li>Clique em "Leitor" e copie um ID do leitor em estado REGULAR</li>
              <li>Clique em "Exemplar" e copie um ID com estado DISPONIVEL</li>
              <li>Cole os IDs nos campos acima</li>
              <li>Clique em "Realizar Empréstimo"</li>
            </ol>
          </div>
        </div>

        {/* Painel de Detalhes */}
        <div>
          {/* Resumo do Empréstimo */}
          {emprestimoRealizado ? (
            <Card className="shadow-premium border-l-4 border-brand-success">
              <CardHeader>
                <CardTitle className="text-lg">✓ Empréstimo Realizado</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-brand-text/60 font-medium">ID Empréstimo</p>
                  <p className="font-mono text-xs break-all">
                    {emprestimoRealizado.id}
                  </p>
                </div>

                <div>
                  <p className="text-brand-text/60 font-medium">Leitor</p>
                  <p className="font-mono text-xs">
                    {emprestimoRealizado.idLeitor}
                  </p>
                </div>

                <div>
                  <p className="text-brand-text/60 font-medium">Exemplar</p>
                  <p className="font-mono text-xs">
                    {emprestimoRealizado.idExemplar}
                  </p>
                </div>

                <div>
                  <p className="text-brand-text/60 font-medium">Início</p>
                  <p>
                    {new Date(emprestimoRealizado.dataInicio).toLocaleDateString(
                      "pt-BR"
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-brand-text/60 font-medium">Expiração</p>
                  <p className="text-brand-primary font-semibold">
                    {new Date(
                      emprestimoRealizado.dataExpiracao
                    ).toLocaleDateString("pt-BR")}
                  </p>
                </div>

                <div>
                  <p className="text-brand-text/60 font-medium">Estado</p>
                  <span className="inline-block bg-brand-success/20 text-brand-success px-3 py-1 rounded text-xs font-semibold">
                    {emprestimoRealizado.estado}
                  </span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="card-secondary">
              <CardHeader>
                <CardTitle className="text-lg">📊 Detalhes</CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-brand-text/60">
                  Os detalhes do empréstimo aparecerão aqui após a realização.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Guia de Validação */}
          <div className="mt-6 card-secondary">
            <h3 className="font-semibold text-brand-text mb-3">
              ✓ Validações
            </h3>
            <ul className="text-xs text-brand-text/80 space-y-1">
              <li>✓ Exemplar deve estar DISPONIVEL</li>
              <li>✓ Leitor em estado REGULAR/INCOMPLETO</li>
              <li>✓ Máximo 5 empréstimos simultâneos</li>
              <li>✓ Prazo padrão: 14 dias</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Histórico de Empréstimos (simulado) */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>📚 Últimos Empréstimos do Sistema</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-secondary/20">
                    <th className="text-left py-2 px-4 text-brand-secondary font-semibold">
                      ID Empréstimo
                    </th>
                    <th className="text-left py-2 px-4 text-brand-secondary font-semibold">
                      Leitor
                    </th>
                    <th className="text-left py-2 px-4 text-brand-secondary font-semibold">
                      Estado
                    </th>
                    <th className="text-left py-2 px-4 text-brand-secondary font-semibold">
                      Expiração
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map((i) => (
                    <tr
                      key={i}
                      className="border-b border-brand-bg hover:bg-brand-bg/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-xs">
                        emp{i}23...abc{i}
                      </td>
                      <td className="py-3 px-4">leitor{i}@example.com</td>
                      <td className="py-3 px-4">
                        <span className="inline-block bg-brand-primary/20 text-brand-primary px-3 py-1 rounded text-xs font-semibold">
                          CORRENTE
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {new Date(
                          Date.now() + i * 24 * 60 * 60 * 1000
                        ).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
