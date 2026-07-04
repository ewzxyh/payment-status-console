"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { LogOut, RefreshCw, Copy, UserPlus } from "lucide-react"
import {
  normalizeStatus,
  statusConfig,
  statusCycle,
  getInitials,
  type AppData,
  type Member,
  type PaymentStatus,
} from "@/lib/members"
import { addMonthKey, currentMonthKey, sortMonthsDesc } from "@/lib/month"
import { MemberRow } from "@/components/member-row"
import { StatusSummary } from "@/components/status-summary"
import { MonthBar } from "@/components/month-bar"
import { CopyExport } from "@/components/copy-export"
import { MemberEditor } from "@/components/member-editor"

type Filter = PaymentStatus | "todos"

const EMPTY: AppData = { members: [], months: {} }
const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function SubscriptionDashboard({ admin = false }: { admin?: boolean }) {
  const { data, mutate, isLoading } = useSWR<{ data: AppData }>(
    "/api/statuses",
    fetcher,
    { refreshInterval: admin ? 0 : 8000, revalidateOnFocus: true },
  )

  const appData = data?.data ?? EMPTY

  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<Filter>("todos")
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [activeMonth, setActiveMonth] = useState<string>("")
  const [copyOpen, setCopyOpen] = useState(false)
  const [editor, setEditor] = useState<{ open: boolean; member: Member | null }>({
    open: false,
    member: null,
  })

  const monthKeys = useMemo(
    () => sortMonthsDesc(Object.keys(appData.months)),
    [appData.months],
  )

  // Mês efetivo: usa o selecionado se existir, senão o mais recente
  const month =
    activeMonth && monthKeys.includes(activeMonth) ? activeMonth : monthKeys[0] ?? ""

  const statusMap = appData.months[month] ?? {}
  const members = appData.members

  function statusOf(id: string): PaymentStatus {
    return normalizeStatus(statusMap[id])
  }

  async function persist(next: AppData) {
    setSaving(true)
    setSaveError("")
    await mutate({ data: next }, { revalidate: false })
    try {
      const res = await fetch("/api/statuses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: next }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? "Falha ao salvar")
      }
    } catch {
      setSaveError("Não foi possível salvar. Verifique a configuração de produção.")
      await mutate()
    } finally {
      setSaving(false)
    }
  }

  function setStatus(id: string, status: PaymentStatus) {
    if (!month) return
    const nextMonth = { ...statusMap, [id]: status }
    persist({ ...appData, months: { ...appData.months, [month]: nextMonth } })
  }

  function cycleStatus(id: string) {
    const current = statusOf(id)
    const idx = statusCycle.indexOf(current)
    const next = statusCycle[(idx + 1) % statusCycle.length]
    setStatus(id, next)
  }

  function addMonth(delta: 1 | -1 = 1) {
    const start = delta === 1 ? monthKeys[0] : monthKeys.at(-1)
    let key = start ? addMonthKey(start, delta) : currentMonthKey()
    while (appData.months[key]) key = addMonthKey(key, delta)
    persist({ ...appData, months: { ...appData.months, [key]: {} } })
    setActiveMonth(key)
  }

  function removeMonth(mk: string) {
    if (monthKeys.length <= 1) return
    const rest = { ...appData.months }
    delete rest[mk]
    persist({ ...appData, months: rest })
    setActiveMonth("")
  }

  function saveMember(input: { name: string; phone?: string }) {
    if (editor.member) {
      // Editar existente
      const nextMembers = members.map((m) =>
        m.id === editor.member!.id ? { ...m, ...input } : m,
      )
      persist({ ...appData, members: nextMembers })
    } else {
      // Novo membro
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `m-${Date.now()}`
      persist({ ...appData, members: [...members, { id, ...input }] })
    }
    setEditor({ open: false, member: null })
  }

  function removeMember(id: string) {
    const nextMembers = members.filter((m) => m.id !== id)
    const nextMonths: AppData["months"] = {}
    for (const [mk, map] of Object.entries(appData.months)) {
      const copy = { ...map }
      delete copy[id]
      nextMonths[mk] = copy
    }
    persist({ members: nextMembers, months: nextMonths })
  }

  const counts = useMemo(() => {
    return members.reduce(
      (acc, m) => {
        acc[statusOf(m.id)] += 1
        return acc
      },
      { pago: 0, "nao-pago": 0 } as Record<PaymentStatus, number>,
    )
  }, [members, statusMap])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return members.filter((m) => {
      const matchesQuery =
        !q ||
        m.name.toLowerCase().includes(q) ||
        (m.phone ?? "").toLowerCase().includes(q)
      const matchesFilter =
        filter === "todos" || statusOf(m.id) === filter
      return matchesQuery && matchesFilter
    })
  }, [members, query, filter, statusMap])

  const filters: { key: Filter; label: string }[] = [
    { key: "todos", label: "Todos" },
    { key: "pago", label: statusConfig.pago.label },
    { key: "nao-pago", label: statusConfig["nao-pago"].label },
  ]

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" })
    window.location.href = "/"
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-balance text-2xl font-semibold tracking-tight">
                Controle de Assinaturas
              </h1>
              {admin && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                  Admin
                </span>
              )}
            </div>
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
              {admin
                ? "Gerencie os meses e membros. Clique no status para marcar pago ou não pago. Tudo é salvo automaticamente."
                : "Visualização dos pagamentos. Somente o administrador pode alterar."}
            </p>
          </div>
          {admin && (
            <button
              onClick={handleLogout}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCopyOpen(true)}
            disabled={!monthKeys.length}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
          >
            <Copy className="h-4 w-4" />
            Copiar meses
          </button>
          {admin && (
            <button
              onClick={() => setEditor({ open: true, member: null })}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              <UserPlus className="h-4 w-4" />
              Adicionar membro
            </button>
          )}
          {saving && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Salvando...
            </span>
          )}
          {saveError && (
            <span className="text-xs font-medium text-unpaid">{saveError}</span>
          )}
        </div>
      </header>

      {(admin || monthKeys.length > 0) && (
        <MonthBar
          months={monthKeys}
          active={month}
          admin={admin}
          onSelect={setActiveMonth}
          onAdd={addMonth}
          onAddPrevious={() => addMonth(-1)}
          onRemove={removeMonth}
        />
      )}

      <StatusSummary counts={counts} total={members.length} />

      <div className="flex flex-col gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={admin ? "Buscar por nome ou telefone..." : "Buscar por nome..."}
          aria-label="Buscar membro"
          className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />

        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Filtrar por status"
        >
          {filters.map((f) => (
            <button
              key={f.key}
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors " +
                (filter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent")
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {isLoading && !data ? (
          <li className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            Carregando...
          </li>
        ) : (
          <>
            {filtered.map((m) => (
              <MemberRow
                key={m.id}
                member={m}
                status={statusOf(m.id)}
                initials={getInitials(m.name)}
                readOnly={!admin}
                onCycle={() => cycleStatus(m.id)}
                onSetStatus={(s) => setStatus(m.id, s)}
                onEdit={() => setEditor({ open: true, member: m })}
                onRemove={() => removeMember(m.id)}
              />
            ))}
            {filtered.length === 0 && (
              <li className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                Nenhum membro encontrado.
              </li>
            )}
          </>
        )}
      </ul>

      {!admin && (
        <footer className="pb-4 text-center">
          <a
            href="/admin"
            className="text-xs font-medium text-muted-foreground underline-offset-4 hover:underline"
          >
            Acesso do administrador
          </a>
        </footer>
      )}

      {copyOpen && (
        <CopyExport
          data={appData}
          monthKeys={monthKeys}
          onClose={() => setCopyOpen(false)}
        />
      )}

      {editor.open && (
        <MemberEditor
          member={editor.member}
          onSave={saveMember}
          onClose={() => setEditor({ open: false, member: null })}
        />
      )}
    </main>
  )
}
