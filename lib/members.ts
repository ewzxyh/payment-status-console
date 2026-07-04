export type PaymentStatus = "pago" | "nao-pago"

export type Member = {
  id: string
  name: string
  phone?: string
}

// Mapa memberId -> status para um mês
export type StatusMap = Record<string, PaymentStatus>

// Estrutura completa persistida no Blob
export type AppData = {
  members: Member[]
  // chave do mês no formato "YYYY-MM" -> mapa de status
  months: Record<string, StatusMap>
}

// Roster inicial (sem status; o status vive por mês)
export const seedMembers: Member[] = [
  { id: "1", name: "Loran Mendonça" },
  { id: "2", name: "Lucas Rezende Kuhn" },
  { id: "3", name: "Emerson Garcia", phone: "+55 62 8104-3304" },
  { id: "4", name: "Emilly", phone: "+55 62 8138-9300" },
  { id: "5", name: "Èmily Vitória Sousa Andra", phone: "+55 63 8122-7039" },
  { id: "6", name: "Giovanna", phone: "+55 62 8445-5187" },
  { id: "7", name: "Glaucya M. Laranjeira", phone: "+55 62 8120-4227" },
  { id: "8", name: "Isa", phone: "+55 62 9138-8169" },
  { id: "9", name: "Juscelino", phone: "+55 62 8474-9159" },
  { id: "10", name: "Jose Amigo Do Enzo" },
  { id: "11", name: "Vinicius" },
  { id: "12", name: "Claudia Cristina", phone: "+55 62 8536-3232" },
  { id: "13", name: "João Thallys", phone: "+55 64 8405-9485" },
  { id: "14", name: "Karla", phone: "+55 62 9990-3949" },
  { id: "15", name: "Fabio Luis Da Fonseca Braga" },
  { id: "16", name: "Geber Mendonça" },
  { id: "17", name: "Henrique" },
  { id: "18", name: "Jao" },
]

// Status inicial variado para o primeiro mês semeado
export const seedStatuses: StatusMap = {
  "1": "pago",
  "2": "nao-pago",
  "3": "nao-pago",
  "4": "pago",
  "5": "nao-pago",
  "6": "nao-pago",
  "7": "pago",
  "8": "nao-pago",
  "9": "nao-pago",
  "10": "pago",
  "11": "pago",
  "12": "nao-pago",
  "13": "nao-pago",
  "14": "pago",
  "15": "nao-pago",
  "16": "pago",
  "17": "nao-pago",
  "18": "nao-pago",
}

export const DEFAULT_STATUS: PaymentStatus = "nao-pago"

export const statusConfig: Record<
  PaymentStatus,
  { label: string; short: string; emoji: string }
> = {
  pago: { label: "Pago", short: "Pago", emoji: "✅" },
  "nao-pago": { label: "Não pago", short: "Não pago", emoji: "❌" },
}

// Ordem de alternância ao clicar
export const statusCycle: PaymentStatus[] = ["nao-pago", "pago"]

export function normalizeStatus(status: unknown): PaymentStatus {
  return status === "pago" ? "pago" : DEFAULT_STATUS
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
