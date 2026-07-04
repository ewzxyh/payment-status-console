"use client"

import { Check, X, Pencil, Trash2 } from "lucide-react"
import { statusConfig, type Member, type PaymentStatus } from "@/lib/members"

type Props = {
  member: Member
  status: PaymentStatus
  initials: string
  readOnly?: boolean
  onCycle?: () => void
  onSetStatus?: (status: PaymentStatus) => void
  onEdit?: () => void
  onRemove?: () => void
}

const statusStyles: Record<PaymentStatus, string> = {
  pago: "bg-paid text-paid-foreground",
  "nao-pago": "bg-unpaid text-unpaid-foreground",
}

const statusIcon: Record<PaymentStatus, typeof Check> = {
  pago: Check,
  "nao-pago": X,
}

const quickActions: PaymentStatus[] = ["nao-pago", "pago"]

export function MemberRow({
  member,
  status,
  initials,
  readOnly = false,
  onCycle,
  onSetStatus,
  onEdit,
  onRemove,
}: Props) {
  const Icon = statusIcon[status]

  return (
    <li className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3">
      <div
        aria-hidden="true"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground"
      >
        {initials}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{member.name}</p>
        {member.phone && (
          <p className="truncate text-xs text-muted-foreground">{member.phone}</p>
        )}
      </div>

      {readOnly ? (
        /* Etiqueta estática de status (somente visualização) */
        <span
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyles[status]}`}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          {statusConfig[status].short}
        </span>
      ) : (
        <>
          {/* Ações rápidas (visíveis em telas maiores) */}
          <div
            className="hidden items-center gap-1 sm:flex"
            role="group"
            aria-label={`Definir status de ${member.name}`}
          >
            {quickActions.map((s) => {
              const QIcon = statusIcon[s]
              const active = status === s
              return (
                <button
                  key={s}
                  onClick={() => onSetStatus?.(s)}
                  aria-pressed={active}
                  title={statusConfig[s].label}
                  className={
                    "flex h-8 w-8 items-center justify-center rounded-lg transition-colors " +
                    (active
                      ? statusStyles[s]
                      : "bg-secondary text-muted-foreground hover:bg-accent hover:text-accent-foreground")
                  }
                >
                  <QIcon className="h-4 w-4" />
                  <span className="sr-only">{statusConfig[s].label}</span>
                </button>
              )
            })}
          </div>

          {/* Badge clicável que alterna o status (principal em mobile) */}
          <button
            onClick={onCycle}
            aria-label={`Status de ${member.name}: ${statusConfig[status].label}. Clique para alterar.`}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-transform active:scale-95 sm:hidden ${statusStyles[status]}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {statusConfig[status].short}
          </button>

          {/* Editar / remover membro */}
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={onEdit}
              title="Editar membro"
              aria-label={`Editar ${member.name}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={onRemove}
              title="Remover membro"
              aria-label={`Remover ${member.name}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors hover:bg-unpaid hover:text-unpaid-foreground"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </li>
  )
}
