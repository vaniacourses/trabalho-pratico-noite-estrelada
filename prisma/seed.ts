import { prisma } from "@/lib/prisma";

/**
 * Script para popular o banco de dados com dados iniciais (seed)
 * Execute com: npm run db:seed
 */
async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  try {
    // Limpar dados existentes (ordem importa por causa de foreign keys)
    console.log("Limpando dados existentes...");
    await prisma.emprestimo.deleteMany();
    await prisma.reserva.deleteMany();
    await prisma.exemplar.deleteMany();
    await prisma.publicacao.deleteMany();
    await prisma.leitor.deleteMany();

    // Criar leitores
    console.log("Criando leitores...");
    const leitor1 = await prisma.leitor.create({
      data: {
        nome: "João Silva",
        email: "joao@example.com",
        senha: "senha123", // Em produção, usar hash com bcrypt
        estado: "REGULAR",
      },
    });

    const leitor2 = await prisma.leitor.create({
      data: {
        nome: "Maria Santos",
        email: "maria@example.com",
        senha: "senha456",
        estado: "REGULAR",
      },
    });

    const leitor3 = await prisma.leitor.create({
      data: {
        nome: "Pedro Oliveira",
        email: "pedro@example.com",
        senha: "senha789",
        estado: "INCOMPLETO",
      },
    });

    // Criar publicações
    console.log("Criando publicações...");
    const publicacao1 = await prisma.publicacao.create({
      data: {
        isbn: "978-0-13-468599-1",
        titulo: "Clean Code",
      },
    });

    const publicacao2 = await prisma.publicacao.create({
      data: {
        isbn: "978-0-201-63361-0",
        titulo: "Design Patterns",
      },
    });

    const publicacao3 = await prisma.publicacao.create({
      data: {
        isbn: "978-0-13-235088-4",
        titulo: "The Pragmatic Programmer",
      },
    });

    // Criar exemplares
    console.log("Criando exemplares...");
    const exemplar1 = await prisma.exemplar.create({
      data: {
        idPublicacao: publicacao1.id,
        estado: "DISPONIVEL",
      },
    });

    const exemplar2 = await prisma.exemplar.create({
      data: {
        idPublicacao: publicacao1.id,
        estado: "DISPONIVEL",
      },
    });

    const exemplar3 = await prisma.exemplar.create({
      data: {
        idPublicacao: publicacao2.id,
        estado: "DISPONIVEL",
      },
    });

    const exemplar4 = await prisma.exemplar.create({
      data: {
        idPublicacao: publicacao3.id,
        estado: "DISPONIVEL",
      },
    });

    // Criar empréstimos
    console.log("Criando empréstimos...");
    const dataExpiracao = new Date();
    dataExpiracao.setDate(dataExpiracao.getDate() + 14);

    const emprestimo1 = await prisma.$transaction(async (tx) => {
      const emp = await tx.emprestimo.create({
        data: {
          idLeitor: leitor1.id,
          idExemplar: exemplar1.id,
          dataExpiracao,
          estado: "CORRENTE",
        },
      });

      await tx.exemplar.update({
        where: { id: exemplar1.id },
        data: { estado: "EMPRESTADO" },
      });

      return emp;
    });

    const emprestimo2 = await prisma.$transaction(async (tx) => {
      const emp = await tx.emprestimo.create({
        data: {
          idLeitor: leitor2.id,
          idExemplar: exemplar3.id,
          dataExpiracao,
          estado: "CORRENTE",
        },
      });

      await tx.exemplar.update({
        where: { id: exemplar3.id },
        data: { estado: "EMPRESTADO" },
      });

      return emp;
    });

    // Criar reservas
    console.log("Criando reservas...");
    const dataExpiracaoReserva = new Date();
    dataExpiracaoReserva.setDate(dataExpiracaoReserva.getDate() + 7);

    const reserva1 = await prisma.reserva.create({
      data: {
        idLeitor: leitor3.id,
        idPublicacao: publicacao2.id,
        dataExpiracao: dataExpiracaoReserva,
        estado: "EM_ESPERA",
      },
    });

    console.log("✅ Seed concluído com sucesso!");
    console.log("\n📊 Resumo dos dados criados:");
    console.log(`- Leitores: 3`);
    console.log(`- Publicações: 3`);
    console.log(`- Exemplares: 4`);
    console.log(`- Empréstimos: 2`);
    console.log(`- Reservas: 1`);
  } catch (error) {
    console.error("❌ Erro ao fazer seed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
