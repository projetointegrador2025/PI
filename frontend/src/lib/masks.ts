// Máscaras para campos de formulário

export function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digits
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export function maskRA(value: string): string {
  // RA: apenas números, até 10 dígitos
  return value.replace(/\D/g, "").slice(0, 10);
}

export function validateCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits[10])) return false;

  return true;
}

/**
 * Máscara de moeda em Real (BRL). Interpreta os dígitos como centavos.
 * Ex: "250000" -> "R$ 2.500,00"
 */
export function maskCurrency(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 12); // até ~R$ 10 bilhões
  if (!digits) return "";
  const cents = parseInt(digits, 10);
  const reais = cents / 100;
  return reais.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Converte um valor mascarado em BRL (ou string numérica livre) para número.
 * Ex: "R$ 2.500,00" -> 2500, "2500.00" -> 2500. Retorna NaN se não houver dígitos.
 */
export function parseCurrency(value: string): number {
  if (!value) return NaN;
  const trimmed = value.trim();
  // Caso venha formatado em pt-BR (com vírgula decimal)
  if (/[.,]/.test(trimmed) && /,/.test(trimmed)) {
    const digits = trimmed.replace(/\D/g, "");
    if (!digits) return NaN;
    return parseInt(digits, 10) / 100;
  }
  // Caso venha como string numérica simples ("2500" ou "2500.50")
  const normalized = trimmed.replace(/[^\d.]/g, "");
  const n = parseFloat(normalized);
  return isNaN(n) ? NaN : n;
}

/**
 * Formata um número como moeda BRL. Ex: 2500 -> "R$ 2.500,00"
 */
export function formatCurrency(value: number): string {
  if (isNaN(value)) return "—";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
