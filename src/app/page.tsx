export default function Home() {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-brand-text mb-4">
          Noite Estrelada
        </h1>
        <p className="text-2xl text-brand-secondary mb-8">
          Sistema de Gerenciamento de Biblioteca
        </p>

        <div className="flex gap-4 justify-center">
          <a
            href="/login"
            className="px-8 py-3 bg-brand-primary text-white rounded font-semibold hover:bg-brand-primary-dark transition-colors shadow-soft"
          >
            Acessar Sistema
          </a>
          <a
            href="/balcao"
            className="px-8 py-3 bg-brand-secondary text-white rounded font-semibold hover:bg-brand-text transition-colors shadow-soft"
          >
            Atendimento
          </a>
        </div>


      </div>
    </div>
  );
}
