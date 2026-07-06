"use client"

import { ChevronLeft, Plus, Trash2 } from "lucide-react"
import { monthShort, monthLabel } from "@/lib/month"

type Props = {
  months: string[] // já ordenados (mais recente primeiro)
  active: string
  admin?: boolean
  onSelect: (month: string) => void
  onAdd?: () => void
  onAddPrevious?: () => void
  onRemove?: (month: string) => void
}

export function MonthBar({
  months,
  active,
  admin = false,
  onSelect,
  onAdd,
  onAddPrevious,
  onRemove,
}: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Mês
        </span>
        {admin && (
          <div className="flex flex-wrap justify-end gap-2">
            <button
              onClick={onAddPrevious}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Mês anterior
            </button>
            <button
              onClick={() => onAdd?.()}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
            >
              <Plus className="h-3.5 w-3.5" />
              Próximo mês
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Selecionar mês">
        {months.map((m) => {
          const isActive = m === active
          return (
            <div key={m} className="flex items-center">
              <button
                role="tab"
                aria-selected={isActive}
                title={monthLabel(m)}
                onClick={() => onSelect(m)}
                className={
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors " +
                  (isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent")
                }
              >
                {monthShort(m)}
              </button>
              {admin && isActive && months.length > 1 && (
                <button
                  onClick={() => onRemove?.(m)}
                  title={`Remover ${monthLabel(m)}`}
                  aria-label={`Remover ${monthLabel(m)}`}
                  className="ml-1 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-unpaid hover:text-unpaid-foreground"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
