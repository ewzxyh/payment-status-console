import "server-only"
import { get, put } from "@vercel/blob"
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

const BLOB_PATH = "subscriptions/data.json"
const DATA_FILE_PATH = process.env.DATA_FILE_PATH?.trim() || ".data/statuses.json"

function hasRemoteStore(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

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

function normalizeData(data: Partial<AppData>): AppData {
  return {
    members: Array.isArray(data.members) ? data.members : seedMembers,
    months: normalizeMonths(data.months),
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

async function getRemoteData(): Promise<AppData> {
  const result = await get(BLOB_PATH, { access: "private" })
  if (!result) return seedData()

  const text = await new Response(result.stream).text()
  if (!text) return seedData()

  return normalizeData(JSON.parse(text) as Partial<AppData>)
}

async function getFileData(): Promise<AppData> {
  try {
    const text = await readFile(dataFilePath(), "utf8")
    if (!text) return seedData()
    return normalizeData(JSON.parse(text) as Partial<AppData>)
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return seedData()
    throw error
  }
}

export async function getData(): Promise<AppData> {
  return hasRemoteStore() ? getRemoteData() : getFileData()
}

export async function saveData(data: AppData): Promise<void> {
  if (hasRemoteStore()) {
    await put(BLOB_PATH, JSON.stringify(data), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    })
    return
  }

  const file = dataFilePath()
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, JSON.stringify(data, null, 2), "utf8")
}
