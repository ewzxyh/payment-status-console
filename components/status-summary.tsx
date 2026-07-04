import type { PaymentStatus } from "@/lib/members"

type Props = {
  counts: Record<PaymentStatus, number>
  total: number
}

const cards: {
  key: PaymentStatus | "total"
  label: string
  className: string
}[] = [
  { key: "total", label: "Total", className: "bg-card text-card-foreground border-border" },
  { key: "pago", label: "Pagos", className: "bg-paid text-paid-foreground border-transparent" },
  { key: "nao-pago", label: "Não pagos", className: "bg-unpaid text-unpaid-foreground border-transparent" },
]

export function StatusSummary({ counts, total }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {cards.map((c) => {
        const value = c.key === "total" ? total : counts[c.key]
        return (
          <div
            key={c.key}
            className={`flex flex-col gap-1 rounded-xl border px-4 py-3 ${c.className}`}
          >
            <span className="text-2xl font-semibold tabular-nums">{value}</span>
            <span className="text-xs font-medium opacity-90">{c.label}</span>
          </div>
        )
      })}
    </div>
  )
}
