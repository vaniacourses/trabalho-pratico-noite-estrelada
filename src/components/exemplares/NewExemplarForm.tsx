"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import Link from "next/link";

interface MidiaOption {
  id: string;
  titulo: string;
  tipo?: string;
}

interface NewExemplarFormProps {
  midias: MidiaOption[];
  onCreated?: () => void;
}

export function NewExemplarForm({ midias, onCreated }: NewExemplarFormProps) {
  const [idMidia, setIdMidia] = useState("");
  const [midiaInput, setMidiaInput] = useState("");
  const [codigo, setCodigo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [fieldError, setFieldError] = useState<string>("");
  const [createdExemplar, setCreatedExemplar] = useState<{ id: string; idMidia?: string } | null>(null);

  const filteredMidias = midiaInput.trim().length > 0
    ? midias.filter((midia) => midia.titulo.toLowerCase().includes(midiaInput.toLowerCase()))
    : [];

  const exactMatch = midias.find((midia) => midia.titulo.toLowerCase() === midiaInput.toLowerCase());
  const selectedMidia = idMidia
    ? midias.find((midia) => midia.id === idMidia)
    : exactMatch || (filteredMidias.length === 1 ? filteredMidias[0] : undefined);

  const inferredMidia = selectedMidia || (filteredMidias.length === 1 ? filteredMidias[0] : undefined);

  useEffect(() => {
    if (idMidia || !midiaInput.trim()) return;

    if (exactMatch) {
      setIdMidia(exactMatch.id);
      return;
    }

    if (filteredMidias.length === 1) {
      setIdMidia(filteredMidias[0].id);
      setMidiaInput(filteredMidias[0].titulo);
    }
  }, [idMidia, midiaInput, exactMatch, filteredMidias]);

  const normalizeTitle = (value: string) =>
    value
      .replace(/[^A-Za-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/(^-|-$)/g, "")
      .toUpperCase();

  const inferredCodigo = selectedMidia
    ? `${selectedMidia.tipo ?? "MIDIA"}-${normalizeTitle(selectedMidia.titulo).slice(0, 20)}-001`
    : "";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!inferredMidia) {
      setAlert({ type: "error", message: "Selecione uma mídia válida para criar o exemplar." });
      return;
    }

    const finalCodigo = codigo.trim() || inferredCodigo;
    if (!finalCodigo) {
      setFieldError("Código do exemplar é obrigatório");
      return;
    }

    setFieldError("");
    setAlert(null);
    setIsSubmitting(true);

    try {
      const mediaId = inferredMidia?.id || (midias.length === 1 ? midias[0]?.id : undefined);

      if (!mediaId) {
        setAlert({ type: "error", message: "Selecione uma mídia válida para criar o exemplar." });
        return;
      }

      const response = await fetch(`/api/midias/${mediaId}/exemplares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idMidia: mediaId, codigo: finalCodigo }),
      });

      const data = await response.json();
      if (!response.ok) {
        const message = data.erro?.mensagem || data.erro?.erros?.codigo || "Erro ao criar exemplar.";
        setAlert({ type: "error", message });
      } else {
        const exemplar = data.dados;
        setCreatedExemplar(exemplar || null);
        setAlert({ type: "success", message: "Exemplar criado com sucesso." });
        setCodigo("");
        if (onCreated) {
          onCreated();
        }
      }
    } catch (error: any) {
      setAlert({ type: "error", message: error?.message || "Erro ao criar exemplar." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (midias.length === 0) {
    return <p>Nenhuma mídia disponível. Crie uma mídia antes de adicionar exemplares.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {alert && (
        <Alert
          variant={alert.type === "success" ? "success" : "error"}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {createdExemplar && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link href={`/exemplares/${createdExemplar.id}`}>
              <Button variant="outline">Visualizar Exemplar</Button>
            </Link>
            <Button
              variant="secondary"
              onClick={() => {
                setCreatedExemplar(null);
                setMidiaInput("");
                setCodigo("");
                setIdMidia("");
                setAlert(null);
              }}
            >
              Criar outro
            </Button>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="midia-search" className="block text-sm font-semibold text-brand-text mb-2">
          Mídia
        </label>
        <Input
          id="midia-search"
          value={midiaInput}
          onChange={(event) => {
            setMidiaInput(event.target.value);
            setFieldError("");
            if (idMidia) {
              setIdMidia("");
            }
          }}
          placeholder="Digite o nome da mídia"
          helperText="Escolha uma mídia existente pelo nome"
        />
        {filteredMidias.length > 0 && (
          <div className="mt-2 rounded border border-brand-secondary/20 bg-white shadow-sm">
            {filteredMidias.slice(0, 5).map((midia) => (
              <button
                key={midia.id}
                type="button"
                onClick={() => {
                  setIdMidia(midia.id);
                  setMidiaInput(midia.titulo);
                  setCodigo("");
                }}
                className="w-full text-left px-3 py-2 text-sm text-brand-text hover:bg-brand-bg"
              >
                {midia.titulo}
              </button>
            ))}
          </div>
        )}
      </div>

      <Input
        label="Código do Exemplar"
        id="codigo"
        type="text"
        value={codigo}
        onChange={(event) => setCodigo(event.target.value)}
        placeholder={inferredCodigo || "Ex: LIVRO-2024-001"}
        error={fieldError}
        disabled={isSubmitting}
      />

      <Button type="submit" loading={isSubmitting} className="w-full">
        Criar Exemplar
      </Button>
    </form>
  );
}
