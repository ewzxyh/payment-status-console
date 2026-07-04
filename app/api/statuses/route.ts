import { NextResponse } from "next/server"
import { getData, saveData } from "@/lib/statuses"
import { isAuthenticated } from "@/lib/auth"
import type { AppData, Member, PaymentStatus, StatusMap } from "@/lib/members"
import { isValidMonthKey } from "@/lib/month"

const VALID: PaymentStatus[] = ["pago", "nao-pago"]

function publicData(data: AppData): AppData {
  return {
    members: data.members.map(({ id, name }) => ({ id, name })),
    months: data.months,
  }
}

export async function GET() {
  const data = await getData()
  return NextResponse.json({
    data: (await isAuthenticated()) ? data : publicData(data),
  })
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as { data?: AppData }
  const incoming = body.data

  if (!incoming || typeof incoming !== "object") {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 })
  }

  // Sanitiza membros
  const members: Member[] = []
  const validIds = new Set<string>()
  if (Array.isArray(incoming.members)) {
    for (const m of incoming.members) {
      if (m && typeof m.id === "string" && typeof m.name === "string" && m.name.trim()) {
        members.push({
          id: m.id,
          name: m.name.trim().slice(0, 80),
          ...(typeof m.phone === "string" && m.phone.trim()
            ? { phone: m.phone.trim().slice(0, 40) }
            : {}),
        })
        validIds.add(m.id)
      }
    }
  }

  // Sanitiza meses e seus status
  const months: Record<string, StatusMap> = {}
  if (incoming.months && typeof incoming.months === "object") {
    for (const [monthKey, map] of Object.entries(incoming.months)) {
      if (!isValidMonthKey(monthKey) || !map || typeof map !== "object") continue
      const clean: StatusMap = {}
      for (const [id, status] of Object.entries(map)) {
        if (validIds.has(id) && VALID.includes(status as PaymentStatus)) {
          clean[id] = status as PaymentStatus
        }
      }
      months[monthKey] = clean
    }
  }

  const clean: AppData = { members, months }
  await saveData(clean)
  return NextResponse.json({ success: true, data: clean })
}
