import { cookies } from "next/headers"
import {
  SESSION_MAX_AGE_SECONDS,
  createSignedSession,
  safeEqual,
  verifySignedSession,
} from "@/lib/auth-token"

export const SESSION_COOKIE = "assinaturas-admin"

function adminEmail() {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? ""
}

function adminPassword() {
  return process.env.ADMIN_PASSWORD ?? ""
}

function sessionSecret() {
  return process.env.SESSION_SECRET ?? ""
}

export function checkCredentials(email: string, password: string): boolean {
  const expectedEmail = adminEmail()
  const expectedPassword = adminPassword()
  if (!expectedEmail || !expectedPassword) return false

  return (
    safeEqual(email.trim().toLowerCase(), expectedEmail) &&
    safeEqual(password, expectedPassword)
  )
}

export function createSessionValue(): string | null {
  const secret = sessionSecret()
  return secret ? createSignedSession(secret) : null
}

export function verifySessionValue(value?: string): boolean {
  const secret = sessionSecret()
  return Boolean(value && secret && verifySignedSession(value, secret))
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies()
  return verifySessionValue(store.get(SESSION_COOKIE)?.value)
}

export { SESSION_MAX_AGE_SECONDS }
