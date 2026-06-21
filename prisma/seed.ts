import { prisma } from "@/lib/prisma";

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  try {
    console.log("Limpando dados existentes...");
    await prisma.emprestimo.deleteMany();
    await prisma.reserva.deleteMany();
    await prisma.exemplar.deleteMany();
    await prisma.midia.deleteMany();
    await prisma.leitor.deleteMany();

    // Usuários
    console.log("Criando usuários...");
    const leitor1 = await prisma.leitor.create({
      data: {
        nome: "João Silva",
        email: "joao@example.com",
        senha: "senha123",
        cpf: "11111111111",
        tipo: "LEITOR",
        estado: "REGULAR",
      },
    });

    const leitor2 = await prisma.leitor.create({
      data: {
        nome: "Maria Santos",
        email: "maria@example.com",
        senha: "senha456",
        cpf: "22222222222",
        tipo: "LEITOR",
        estado: "REGULAR",
      },
    });

    const leitor3 = await prisma.leitor.create({
      data: {
        nome: "Pedro Oliveira",
        email: "pedro@example.com",
        senha: "senha789",
        tipo: "LEITOR",
        estado: "INCOMPLETO",
      },
    });

    await prisma.leitor.create({
      data: {
        nome: "Ana Atendente",
        email: "atendente@biblioteca.com",
        senha: "atend123",
        tipo: "ATENDENTE",
        estado: "REGULAR",
      },
    });

    await prisma.leitor.create({
      data: {
        nome: "Carlos Gerente",
        email: "gerente@biblioteca.com",
        senha: "gerente123",
        tipo: "GERENTE",
        estado: "REGULAR",
      },
    });

    // Mídias
    console.log("Criando mídias...");
    const midia1 = await prisma.midia.create({
      data: {
        tipo: "PUBLICACAO",
        titulo: "Clean Code",
        dados: { autor: "Robert C. Martin", isbn: "9780132350884", paginas: 431 },
      },
    });

    const midia2 = await prisma.midia.create({
      data: {
        tipo: "PUBLICACAO",
        titulo: "Design Patterns",
        dados: { autor: "Gang of Four", isbn: "9780201633610", paginas: 395 },
      },
    });

    const midia3 = await prisma.midia.create({
      data: {
        tipo: "DVD",
        titulo: "The Matrix",
        dados: { diretor: "Wachowski", codigoDeRegiao: "1", legendas: ["pt", "en"], duracao: 136 },
      },
    });

    const midia4 = await prisma.midia.create({
      data: {
        tipo: "CD",
        titulo: "Dark Side of the Moon",
        dados: { artista: "Pink Floyd", faixas: ["Speak to Me:2", "Breathe:2", "Time:6"], duracao: 43 },
      },
    });

    // Exemplares
    console.log("Criando exemplares...");
    function genCodigo(prefix: string, i: number) {
      const clean = prefix.replace(/\s+/g, "").slice(0, 6).toUpperCase();
      return `${clean}-${Date.now().toString().slice(-5)}-${i}`;
    }

    const exemplar1 = await prisma.exemplar.create({
      data: { idMidia: midia1.id, codigo: genCodigo(midia1.titulo, 1), estado: "DISPONIVEL" },
    });

    const exemplar2 = await prisma.exemplar.create({
      data: { idMidia: midia1.id, codigo: genCodigo(midia1.titulo, 2), estado: "DISPONIVEL" },
    });

    const exemplar3 = await prisma.exemplar.create({
      data: { idMidia: midia2.id, codigo: genCodigo(midia2.titulo, 1), estado: "DISPONIVEL" },
    });

    const exemplar4 = await prisma.exemplar.create({
      data: { idMidia: midia3.id, codigo: genCodigo(midia3.titulo, 1), estado: "DISPONIVEL" },
    });

    // Garantir exemplar para a midia4 (CD)
    const exemplar5 = await prisma.exemplar.create({
      data: { idMidia: midia4.id, codigo: genCodigo(midia4.titulo, 1), estado: "DISPONIVEL" },
    });

    // Empréstimos
    console.log("Criando empréstimos...");
    const dataExpiracao = new Date();
    dataExpiracao.setDate(dataExpiracao.getDate() + 14);

    await prisma.$transaction(async (tx) => {
      await tx.emprestimo.create({
        data: { idLeitor: leitor1.id, idExemplar: exemplar1.id, dataExpiracao, estado: "CORRENTE" },
      });
      await tx.exemplar.update({
        where: { id: exemplar1.id },
        data: { estado: "EMPRESTADO" },
      });
    });

    await prisma.$transaction(async (tx) => {
      await tx.emprestimo.create({
        data: { idLeitor: leitor2.id, idExemplar: exemplar3.id, dataExpiracao, estado: "CORRENTE" },
      });
      await tx.exemplar.update({
        where: { id: exemplar3.id },
        data: { estado: "EMPRESTADO" },
      });
    });

    // Reservas
    console.log("Criando reservas...");
    const dataExpiracaoReserva = new Date();
    dataExpiracaoReserva.setDate(dataExpiracaoReserva.getDate() + 7);

    await prisma.reserva.create({
      data: {
        idLeitor: leitor3.id,
        idMidia: midia2.id,
        dataMidia: dataExpiracaoReserva,
        estado: "EM_ESPERA",
      },
    });

    console.log("✅ Seed concluído com sucesso!");
    console.log("\n📊 Resumo:");
    console.log("  Usuários: 5 (3 leitores, 1 atendente, 1 gerente)");
    console.log("  Mídias: 4 (2 publicações, 1 DVD, 1 CD)");
    console.log("  Exemplares: 5");
    console.log("  Empréstimos: 2");
    console.log("  Reservas: 1");
    console.log("\n🔑 Credenciais de teste:");
    console.log("  [LEITOR]    joao@example.com / senha123");
    console.log("  [LEITOR]    maria@example.com / senha456");
    console.log("  [LEITOR]    pedro@example.com / senha789");
    console.log("  [ATENDENTE] atendente@biblioteca.com / atend123");
    console.log("  [GERENTE]   gerente@biblioteca.com / gerente123");
  } catch (error) {
    console.error("❌ Erro ao fazer seed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
