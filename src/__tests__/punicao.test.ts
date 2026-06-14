import {
  DIAS_LIMITE_PUNICAO,
  diasDeAtraso,
  determinarEstadoPunicao,
  estadoBaseDoLeitor,
} from "@/domain/punicao";

const MS_DIA = 1000 * 60 * 60 * 24;

describe("diasDeAtraso", () => {
  const agora = new Date("2026-06-20T12:00:00Z");

  it("✅ retorna 0 quando ainda não venceu", () => {
    const futuro = new Date(agora.getTime() + 5 * MS_DIA);
    expect(diasDeAtraso(futuro, agora)).toBe(0);
  });

  it("✅ retorna 0 exatamente na data de expiração", () => {
    expect(diasDeAtraso(agora, agora)).toBe(0);
  });

  it("✅ conta os dias inteiros desde a expiração", () => {
    const venceuHa3Dias = new Date(agora.getTime() - 3 * MS_DIA);
    expect(diasDeAtraso(venceuHa3Dias, agora)).toBe(3);
  });

  it("✅ aceita string de data", () => {
    const venceuHa10Dias = new Date(agora.getTime() - 10 * MS_DIA).toISOString();
    expect(diasDeAtraso(venceuHa10Dias, agora)).toBe(10);
  });
});

describe("estadoBaseDoLeitor", () => {
  it("✅ REGULAR quando todos os campos estão preenchidos", () => {
    expect(
      estadoBaseDoLeitor({
        nome: "Ana",
        senha: "123456",
        email: "ana@x.com",
        cpf: "12345678900",
        dataDeNascimento: new Date("1990-01-01"),
      })
    ).toBe("REGULAR");
  });

  it("✅ INCOMPLETO quando falta algum campo", () => {
    expect(
      estadoBaseDoLeitor({ nome: "Ana", senha: "123456", email: "", cpf: null, dataDeNascimento: null })
    ).toBe("INCOMPLETO");
  });
});

describe("determinarEstadoPunicao", () => {
  it("✅ mantém o estado base quando não há atraso", () => {
    expect(
      determinarEstadoPunicao({ estadoAtual: "REGULAR", maxDiasAtraso: 0, estadoBase: "REGULAR" })
    ).toBe("REGULAR");
    expect(
      determinarEstadoPunicao({ estadoAtual: "INCOMPLETO", maxDiasAtraso: 0, estadoBase: "INCOMPLETO" })
    ).toBe("INCOMPLETO");
  });

  it("✅ EM_PUNICAO quando há atraso dentro do limite de 15 dias", () => {
    expect(
      determinarEstadoPunicao({ estadoAtual: "REGULAR", maxDiasAtraso: 1, estadoBase: "REGULAR" })
    ).toBe("EM_PUNICAO");
    expect(
      determinarEstadoPunicao({
        estadoAtual: "REGULAR",
        maxDiasAtraso: DIAS_LIMITE_PUNICAO,
        estadoBase: "REGULAR",
      })
    ).toBe("EM_PUNICAO");
  });

  it("✅ BANIDO quando o atraso ultrapassa 15 dias", () => {
    expect(
      determinarEstadoPunicao({
        estadoAtual: "EM_PUNICAO",
        maxDiasAtraso: DIAS_LIMITE_PUNICAO + 1,
        estadoBase: "REGULAR",
      })
    ).toBe("BANIDO");
  });

  it("✅ limpa a punição (volta ao estado base) quando o atraso é regularizado", () => {
    expect(
      determinarEstadoPunicao({ estadoAtual: "EM_PUNICAO", maxDiasAtraso: 0, estadoBase: "REGULAR" })
    ).toBe("REGULAR");
  });

  it("✅ BANIDO é terminal — permanece mesmo sem atraso atual", () => {
    expect(
      determinarEstadoPunicao({ estadoAtual: "BANIDO", maxDiasAtraso: 0, estadoBase: "REGULAR" })
    ).toBe("BANIDO");
  });
});
