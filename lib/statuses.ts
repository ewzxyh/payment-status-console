import "server-only"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, isAbsolute, join } from "node:path"
import {
  normalizeStatus,
  seedMembers,
  seedStatuses,
  type AppData,
  type StatusMap,
} from "@/lib/members"
import { currentMonthKey } from "@/lib/month"

const DATA_FILE_PATH = process.env.DATA_FILE_PATH?.trim() || ".data/statuses.json"

function dataFilePath(): string {
  return isAbsolute(DATA_FILE_PATH)
    ? DATA_FILE_PATH
    : join(/*turbopackIgnore: true*/ process.cwd(), DATA_FILE_PATH)
}

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

export async function getData(): Promise<AppData> {
  try {
    const text = await readFile(dataFilePath(), "utf8")
    if (!text) return seedData()

    const parsed = JSON.parse(text) as Partial<AppData>
    return {
      members: Array.isArray(parsed.members) ? parsed.members : seedMembers,
      months: normalizeMonths(parsed.months),
    }
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return seedData()
    console.error("Erro ao ler dados salvos:", error)
    return seedData()
  }
}

export async function saveData(data: AppData): Promise<void> {
  const file = dataFilePath()
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, JSON.stringify(data, null, 2), "utf8")
}
