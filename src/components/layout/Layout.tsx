"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const TIPOS_FUNCIONARIO = ["ATENDENTE", "GERENTE"];

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

/**
 * Layout para páginas públicas (login, etc)
 */
export const PublicLayout: React.FC<LayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-slideInLeft">
          <h1 className="text-4xl font-bold text-brand-text mb-2">
            Noite Estrelada
          </h1>
          <p className="text-brand-secondary">
            Sistema de Gerenciamento de Biblioteca
          </p>
        </div>

        {/* Content */}
        <div className="animate-fadeIn">{children}</div>
      </div>
    </div>
  );
};

/**
 * Layout para páginas autenticadas (dashboard, balcão, etc)
 */
export const AuthenticatedLayout: React.FC<LayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  const router = useRouter();
  const [nomeUsuario, setNomeUsuario] = useState<string>("");
  const [destinoInicio, setDestinoInicio] = useState<string>("/portal");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("usuario");
      if (raw) {
        const usuario = JSON.parse(raw);
        setNomeUsuario(usuario.nome || "");
        setDestinoInicio(TIPOS_FUNCIONARIO.includes(usuario.tipo) ? "/balcao" : "/portal");
      }
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-soft sticky top-0 z-50">
        <div className="container-premium py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-brand-text">
                Noite Estrelada
              </h1>
              <p className="text-sm text-brand-secondary">
                Sistema de Gerenciamento de Biblioteca
              </p>
            </div>
            <div className="flex items-center gap-4">
              {nomeUsuario && (
                <span className="hidden sm:block text-sm text-brand-text text-right">
                  Seja bem-vindo,<br /><span className="font-semibold">{nomeUsuario}</span>
                </span>
              )}
              <button
                className="px-4 py-2 border border-brand-primary text-brand-primary rounded hover:bg-brand-primary hover:text-white transition-all"
                onClick={() => router.push(destinoInicio)}
              >
                Início
              </button>
              <button
                className="px-4 py-2 bg-brand-error text-white rounded hover:bg-opacity-90 transition-all"
                onClick={() => {
                  localStorage.removeItem("usuario");
                  window.location.href = "/";
                }}
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full">
        <div className="container-premium py-8">
          {title && (
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-brand-text">{title}</h2>
              {subtitle && (
                <p className="text-brand-secondary mt-2">{subtitle}</p>
              )}
            </div>
          )}

          <div className="animate-fadeIn">{children}</div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-brand-secondary/20 mt-12">
        <div className="container-premium py-6 text-center text-sm text-brand-secondary">
          <p>&copy; 2025 Noite Estrelada. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};
