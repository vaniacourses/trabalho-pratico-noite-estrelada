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
    await prisma.midia.deleteMany();
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

    // Criar mídias
    console.log("Criando mídias...");
    const midia1 = await prisma.midia.create({
      data: {
        tipo: "PUBLICACAO",
        titulo: "Clean Code",
        dados: { isbn: "978-0-13-468599-1" },
      },
    });

    const midia2 = await prisma.midia.create({
      data: {
        tipo: "PUBLICACAO",
        titulo: "Design Patterns",
        dados: { isbn: "978-0-201-63361-0" },
      },
    });

    const midia3 = await prisma.midia.create({
      data: {
        tipo: "PUBLICACAO",
        titulo: "The Pragmatic Programmer",
        dados: { isbn: "978-0-13-235088-4" },
      },
    });

    // Criar exemplares
    console.log("Criando exemplares...");
    const exemplar1 = await prisma.exemplar.create({
      data: {
        idMidia: midia1.id,
        estado: "DISPONIVEL",
      },
    });

    const exemplar2 = await prisma.exemplar.create({
      data: {
        idMidia: midia1.id,
        estado: "DISPONIVEL",
      },
    });

    const exemplar3 = await prisma.exemplar.create({
      data: {
        idMidia: midia2.id,
        estado: "DISPONIVEL",
      },
    });

    const exemplar4 = await prisma.exemplar.create({
      data: {
        idMidia: midia3.id,
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
    const dataMidia = new Date();

    const reserva1 = await prisma.reserva.create({
      data: {
        idLeitor: leitor3.id,
        idMidia: midia2.id,
        dataMidia,
        estado: "EM_ESPERA",
      },
    });

    console.log("✅ Seed concluído com sucesso!");
    console.log("\n📊 Resumo dos dados criados:");
    console.log(`- Leitores: 3`);
    console.log(`- Mídias: 3`);
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
