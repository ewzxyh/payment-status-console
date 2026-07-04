"use client"

import { useMemo, useState } from "react"
import { Copy, Check, X } from "lucide-react"
import {
  DEFAULT_STATUS,
  type AppData,
} from "@/lib/members"
import { monthLabel, sortMonthsDesc } from "@/lib/month"

type Props = {
  data: AppData
  monthKeys: string[]
  onClose: () => void
}

function buildText(data: AppData, months: string[]): string {
  const ordered = sortMonthsDesc(months)
  const blocks = ordered.map((mk) => {
    const map = data.months[mk] ?? {}
    const lines = data.members.map((m) => {
      const paid = (map[m.id] ?? DEFAULT_STATUS) === "pago"
      return `- ${paid ? "✅" : "❌"} ${m.name}`
    })
    return `📅 ${monthLabel(mk)}\n${lines.join("\n")}`
  })
  return blocks.join("\n\n")
}

export function CopyExport({ data, monthKeys, onClose }: Props) {
  const [selected, setSelected] = useState<string[]>(monthKeys.slice(0, 1))
  const [copied, setCopied] = useState(false)

  const text = useMemo(
    () => (selected.length ? buildText(data, selected) : ""),
    [data, selected],
  )

  function toggle(mk: string) {
    setSelected((prev) =>
      prev.includes(mk) ? prev.filter((k) => k !== mk) : [...prev, mk],
    )
    setCopied(false)
  }

  async function copy() {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Copiar meses"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Copiar meses</h2>
            <p className="text-sm text-muted-foreground">
              Selecione um ou mais meses para gerar a lista com ✅ / ❌.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {monthKeys.map((mk) => {
            const on = selected.includes(mk)
            return (
              <button
                key={mk}
                onClick={() => toggle(mk)}
                aria-pressed={on}
                className={
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors " +
                  (on
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent")
                }
              >
                {on && <Check className="h-3.5 w-3.5" />}
                {monthLabel(mk)}
              </button>
            )
          })}
        </div>

        <pre className="min-h-32 flex-1 overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-secondary/50 p-3 text-sm leading-relaxed">
          {text || "Selecione ao menos um mês."}
        </pre>

        <button
          onClick={copy}
          disabled={!text}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copiado!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copiar lista
            </>
          )}
        </button>
      </div>
    </div>
  )
}
