import { normalizarCpf, formatCpf } from "@/utils/helpers";

describe("normalizarCpf", () => {
  it("✅ deve remover toda a pontuação, mantendo apenas dígitos", () => {
    expect(normalizarCpf("123.456.789-00")).toBe("12345678900");
  });

  it("✅ deve manter um CPF que já está só com dígitos", () => {
    expect(normalizarCpf("12345678900")).toBe("12345678900");
  });

  it("✅ deve retornar string vazia para null/undefined/vazio", () => {
    expect(normalizarCpf(null)).toBe("");
    expect(normalizarCpf(undefined)).toBe("");
    expect(normalizarCpf("")).toBe("");
  });
});

describe("formatCpf", () => {
  it("✅ deve aplicar a máscara em um CPF só com dígitos", () => {
    expect(formatCpf("12345678900")).toBe("123.456.789-00");
  });

  it("✅ deve reaplicar a máscara em um CPF já pontuado (idempotente)", () => {
    expect(formatCpf("123.456.789-00")).toBe("123.456.789-00");
  });

  it("✅ deve mascarar valores parciais progressivamente", () => {
    expect(formatCpf("123")).toBe("123");
    expect(formatCpf("1234")).toBe("123.4");
    expect(formatCpf("1234567")).toBe("123.456.7");
    expect(formatCpf("1234567890")).toBe("123.456.789-0");
  });

  it("✅ deve ignorar dígitos além de 11", () => {
    expect(formatCpf("123456789001234")).toBe("123.456.789-00");
  });

  it("✅ deve retornar string vazia para valores nulos/vazios", () => {
    expect(formatCpf(null)).toBe("");
    expect(formatCpf("")).toBe("");
  });
});
