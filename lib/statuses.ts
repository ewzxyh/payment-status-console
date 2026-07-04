import "server-only"
import { put, get } from "@vercel/blob"
import {
  normalizeStatus,
  seedMembers,
  seedStatuses,
  type AppData,
  type StatusMap,
} from "@/lib/members"
import { currentMonthKey } from "@/lib/month"

const BLOB_PATH = "subscriptions/data.json"

// Dados iniciais: roster semeado + um mês (mês atual) com status variados
function seedData(): AppData {
  return {
    members: seedMembers,
    months: { [currentMonthKey()]: seedStatuses },
  }
}

function normalizeMonths(months: unknown): AppData["months"] {
  if (!months || typeof months !== "object") return {}

  const clean: AppData["months"] = {}
  for (const [month, map] of Object.entries(months)) {
    if (!map || typeof map !== "object") continue
    const statuses: StatusMap = {}
    for (const [memberId, status] of Object.entries(map)) {
      statuses[memberId] = normalizeStatus(status)
    }
    clean[month] = statuses
  }
  return clean
}

// Lê os dados salvos no Blob (store privado). Retorna dados semeados se não existir.
export async function getData(): Promise<AppData> {
  try {
    const result = await get(BLOB_PATH, { access: "private" })
    if (!result) return seedData()

    const text = await new Response(result.stream).text()
    if (!text) return seedData()

    const parsed = JSON.parse(text) as Partial<AppData>
    return {
      members: Array.isArray(parsed.members) ? parsed.members : seedMembers,
      months: normalizeMonths(parsed.months),
    }
  } catch (error) {
    console.error("Erro ao ler dados do Blob:", error)
    return seedData()
  }
}

// Salva os dados no Blob, sobrescrevendo o arquivo existente.
export async function saveData(data: AppData): Promise<void> {
  await put(BLOB_PATH, JSON.stringify(data), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  })
}
