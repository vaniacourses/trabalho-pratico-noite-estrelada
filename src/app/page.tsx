export default function Home() {
  const noticias = [
    {
      tag: "Novidade",
      tagColor: "bg-brand-accent/30 text-brand-secondary",
      titulo: "Novo acervo de DVDs disponível",
      descricao: "Mais de 50 títulos clássicos e contemporâneos foram adicionados ao acervo. Venha conferir e faça seu empréstimo.",
      data: "Jun 2026",
    },
    {
      tag: "Evento",
      tagColor: "bg-brand-primary/20 text-brand-primary-dark",
      titulo: "Semana da Leitura",
      descricao: "Participe da nossa semana especial com rodas de leitura, debates literários e empréstimos sem fila de espera.",
      data: "Jun 2026",
    },
    {
      tag: "Aviso",
      tagColor: "bg-brand-error/15 text-brand-error",
      titulo: "Horário estendido em julho",
      descricao: "Durante o mês de julho a biblioteca funcionará das 8h às 22h, incluindo sábados, para atender a demanda do período de provas.",
      data: "Mai 2026",
    },
  ];

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">

      {/* Header */}
      <header className="w-full px-8 py-5 flex items-center justify-between border-b border-brand-secondary/15 bg-brand-bg sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-brand-text tracking-tight">Noite Estrelada</span>
          <span className="hidden sm:inline text-brand-secondary/50 text-xl font-light ml-1">·</span>
          <span className="hidden sm:inline text-sm text-brand-secondary">Biblioteca</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/login?contexto=leitor"
            className="px-5 py-2 text-sm font-semibold text-brand-text border border-brand-secondary/30 rounded hover:bg-brand-bg-alt transition-colors"
          >
            Área do Leitor
          </a>
          <a
            href="/login?contexto=funcionario"
            className="px-5 py-2 text-sm font-semibold text-white bg-brand-secondary rounded hover:bg-brand-text transition-colors shadow-soft"
          >
            Funcionários
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <span className="inline-block mb-4 text-xs font-semibold tracking-widest uppercase text-brand-primary bg-brand-primary/10 px-4 py-1.5 rounded-full">
          Sistema de Gerenciamento de Biblioteca
        </span>
        <h1 className="text-6xl sm:text-7xl font-extrabold text-brand-text leading-tight max-w-3xl">
          Sua leitura,<br />
          <span className="text-brand-primary">sempre ao alcance.</span>
        </h1>
        <p className="mt-6 text-lg text-brand-secondary max-w-xl">
          Explore nosso acervo de livros, DVDs e CDs. Faça empréstimos, acompanhe devoluções e descubra novidades — tudo em um só lugar.
        </p>
        <div className="mt-10 flex gap-4 flex-wrap justify-center">
          <a
            href="/login?contexto=leitor"
            className="px-8 py-3.5 bg-brand-primary text-white font-semibold rounded hover:bg-brand-primary-dark transition-colors shadow-premium"
          >
            Acessar como Leitor
          </a>
          <a
            href="#noticias"
            className="px-8 py-3.5 border-2 border-brand-secondary/30 text-brand-text font-semibold rounded hover:bg-brand-bg-alt transition-colors"
          >
            Ver novidades
          </a>
        </div>
      </section>

      {/* Notícias */}
      <section id="noticias" className="px-6 sm:px-12 lg:px-24 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary mb-1">Novidades</p>
              <h2 className="text-3xl font-bold text-brand-text">Acontecendo na biblioteca</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {noticias.map((n, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-soft p-6 flex flex-col gap-3 hover:shadow-premium transition-shadow"
              >
                <span className={`self-start text-xs font-semibold px-3 py-1 rounded-full ${n.tagColor}`}>
                  {n.tag}
                </span>
                <h3 className="text-lg font-bold text-brand-text leading-snug">{n.titulo}</h3>
                <p className="text-sm text-brand-secondary leading-relaxed flex-1">{n.descricao}</p>
                <p className="text-xs text-brand-secondary/60 font-medium">{n.data}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nossa História */}
      <section className="bg-white border-t border-brand-secondary/15 px-6 sm:px-12 lg:px-24 py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary mb-3">Nossa História</p>
            <h2 className="text-4xl font-bold text-brand-text mb-5 leading-tight">
              Décadas conectando pessoas ao conhecimento
            </h2>
            <p className="text-brand-secondary leading-relaxed mb-4">
              Fundada com o propósito de democratizar o acesso à cultura e ao conhecimento, a Biblioteca Noite Estrelada cresceu ao lado da comunidade, tornando-se um espaço de descobertas, aprendizado e memória coletiva.
            </p>
            <p className="text-brand-secondary leading-relaxed">
              Hoje contamos com um acervo diversificado — de obras clássicas a mídias digitais — e um sistema moderno que permite a qualquer leitor reservar, emprestar e acompanhar seus títulos favoritos de forma simples e rápida.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              {valor: "500+", label: "Títulos no acervo"},
              {valor: "1.2k", label: "Leitores cadastrados"},
              {valor: "98%", label: "Satisfação dos usuários"},
              {valor: "14", label: "Dias de empréstimo"},
            ].map((stat, i) => (
              <div key={i} className="bg-brand-bg rounded-lg p-6 text-center">
                <p className="text-4xl font-extrabold text-brand-primary">{stat.valor}</p>
                <p className="text-sm text-brand-secondary mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-secondary/15 bg-brand-bg px-6 py-6 text-center text-sm text-brand-secondary">
        © 2025 Noite Estrelada. Todos os direitos reservados.
      </footer>
    </div>
  );
}
