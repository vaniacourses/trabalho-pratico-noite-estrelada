import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Noite Estrelada - Sistema de Biblioteca",
  description:
    "Sistema de Gerenciamento de Biblioteca com arquitetura em camadas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
