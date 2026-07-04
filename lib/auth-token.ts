import { createHmac, randomBytes, timingSafeEqual } from "node:crypto"

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

export function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  )
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url")
}

export function createSignedSession(secret: string, now = Date.now()): string {
  if (!secret) throw new Error("SESSION_SECRET is required")
  const issuedAt = Math.floor(now / 1000).toString(36)
  const nonce = randomBytes(16).toString("base64url")
  const payload = `${issuedAt}.${nonce}`
  return `${payload}.${sign(payload, secret)}`
}

export function verifySignedSession(
  value: string,
  secret: string,
  now = Date.now(),
): boolean {
  if (!value || !secret) return false

  const [issuedAtRaw, nonce, signature, extra] = value.split(".")
  if (!issuedAtRaw || !nonce || !signature || extra) return false

  const issuedAt = Number.parseInt(issuedAtRaw, 36)
  if (!Number.isFinite(issuedAt)) return false

  const age = Math.floor(now / 1000) - issuedAt
  if (age < 0 || age > SESSION_MAX_AGE_SECONDS) return false

  return safeEqual(signature, sign(`${issuedAtRaw}.${nonce}`, secret))
}
