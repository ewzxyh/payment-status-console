// Utilitários de mês no formato "YYYY-MM" (seguros para cliente e servidor)

export function currentMonthKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

export function isValidMonthKey(key: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(key)
}

// "2026-01" -> "Janeiro de 2026"
export function monthLabel(key: string): string {
  if (!isValidMonthKey(key)) return key
  const [year, month] = key.split("-").map(Number)
  const date = new Date(year, month - 1, 1)
  const label = date.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

// "2026-01" -> "Jan/26" (compacto para abas)
export function monthShort(key: string): string {
  if (!isValidMonthKey(key)) return key
  const [year, month] = key.split("-").map(Number)
  const date = new Date(year, month - 1, 1)
  const m = date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")
  return `${m.charAt(0).toUpperCase() + m.slice(1)}/${String(year).slice(2)}`
}

export function addMonthKey(key: string, delta: number): string {
  const [year, month] = key.split("-").map(Number)
  const date = new Date(year, month - 1 + delta, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

// Ordena do mais recente para o mais antigo
export function sortMonthsDesc(keys: string[]): string[] {
  return [...keys].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))
}
