import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Brand Premium
        "brand": {
          "bg": "#F4EFEA",      // Fundo: Bege/Creme claro
          "bg-alt": "#EAE0D5",  // Alternativo mais quente
          "primary": "#AF764F", // Primária: Caramelo/Terracota
          "primary-dark": "#9C5B32", // Primária escura
          "secondary": "#7A4222", // Secundária: Marrom intermediário
          "text": "#4A2511",    // Texto escuro: Chocolate/Marrom
          "text-light": "#F9F6F3", // Texto claro: Branco com tom quente
          "accent": "#C9A961",  // Accent: Dourado suave
          "error": "#D97757",   // Erro (vermelho/coral)
          "success": "#6B8E23", // Sucesso (verde oliva)
          "warning": "#DAA520", // Aviso (dourado)
        },
      },
      fontFamily: {
        sans: ["system-ui", "sans-serif"],
        serif: ["Georgia", "serif"],
      },
      boxShadow: {
        subtle: "0 2px 8px rgba(74, 37, 17, 0.08)",
        soft: "0 4px 16px rgba(74, 37, 17, 0.12)",
        premium: "0 8px 24px rgba(74, 37, 17, 0.15)",
      },
      borderRadius: {
        DEFAULT: "8px",
      },
    },
  },
  plugins: [],
};

export default config;
