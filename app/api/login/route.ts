import { type NextRequest, NextResponse } from "next/server"
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  checkCredentials,
  createSessionValue,
} from "@/lib/auth"

const WINDOW_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 5
const attempts = new Map<string, { count: number; resetAt: number }>()

function clientKey(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  )
}

function isLimited(key: string): boolean {
  const item = attempts.get(key)
  if (!item || item.resetAt <= Date.now()) return false
  return item.count >= MAX_ATTEMPTS
}

function recordFailure(key: string) {
  const now = Date.now()
  const item = attempts.get(key)
  if (!item || item.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return
  }
  item.count += 1
}

export async function POST(request: NextRequest) {
  const key = clientKey(request)
  if (isLimited(key)) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em alguns minutos." },
      { status: 429 },
    )
  }

  const { email, password } = await request.json().catch(() => ({}))

  if (!checkCredentials(email ?? "", password ?? "")) {
    recordFailure(key)
    return NextResponse.json(
      { error: "E-mail ou senha invalidos." },
      { status: 401 },
    )
  }

  const sessionValue = createSessionValue()
  if (!sessionValue) {
    return NextResponse.json(
      { error: "Login indisponivel. Configure SESSION_SECRET." },
      { status: 500 },
    )
  }

  attempts.delete(key)
  const response = NextResponse.json({ success: true })
  response.cookies.set(SESSION_COOKIE, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
  return response
}
