import assert from "node:assert/strict"
import { describe, test } from "node:test"
import {
  SESSION_MAX_AGE_SECONDS,
  createSignedSession,
  verifySignedSession,
} from "./auth-token"

describe("signed admin session", () => {
  test("accepts a fresh signed session", () => {
    const token = createSignedSession("test-secret", 1_000_000)

    assert.equal(verifySignedSession(token, "test-secret", 1_000_000), true)
  })

  test("rejects tampered, wrong-secret, and expired sessions", () => {
    const token = createSignedSession("test-secret", 1_000_000)

    assert.equal(verifySignedSession(`${token}x`, "test-secret", 1_000_000), false)
    assert.equal(verifySignedSession(token, "other-secret", 1_000_000), false)
    assert.equal(
      verifySignedSession(
        token,
        "test-secret",
        1_000_000 + (SESSION_MAX_AGE_SECONDS + 1) * 1000,
      ),
      false,
    )
  })
})
