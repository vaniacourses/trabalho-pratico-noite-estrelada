/**
 * Validadores reutilizáveis para formulários
 */

export const validators = {
  required: (value: any): string | null => {
    return !value || value.toString().trim() === "" ? "Este campo é obrigatório" : null;
  },

  email: (value: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(value) ? "Email inválido" : null;
  },

  minLength: (min: number) => (value: string): string | null => {
    return value.length < min ? `Mínimo ${min} caracteres` : null;
  },

  maxLength: (max: number) => (value: string): string | null => {
    return value.length > max ? `Máximo ${max} caracteres` : null;
  },

  uuid: (value: string): string | null => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const cuidRegex = /^c[a-z0-9]{24}$/;

    return uuidRegex.test(value) || cuidRegex.test(value)
      ? null
      : "ID inválido";
  },

  phoneNumber: (value: string): string | null => {
    const phoneRegex = /^(\+\d{1,3}[-.\s]?)?\d{1,14}$/;
    return !phoneRegex.test(value.replace(/\s/g, ""))
      ? "Número de telefone inválido"
      : null;
  },

  strongPassword: (value: string): string | null => {
    if (value.length < 8) return "Mínimo 8 caracteres";
    if (!/[A-Z]/.test(value)) return "Deve conter letra maiúscula";
    if (!/[a-z]/.test(value)) return "Deve conter letra minúscula";
    if (!/\d/.test(value)) return "Deve conter número";
    if (!/[!@#$%^&*]/.test(value)) return "Deve conter caractere especial (!@#$%^&*)";
    return null;
  },
};

/**
 * Função auxiliar para validar múltiplos campos
 */
export function validateFields(
  data: Record<string, any>,
  rules: Record<string, ((value: any) => string | null)[]>
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const [field, validatorList] of Object.entries(rules)) {
    for (const validator of validatorList) {
      const error = validator(data[field]);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  }

  return errors;
}
