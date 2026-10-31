type OaProps = Record<string, string | number | boolean>
type Oa = ((...args: unknown[]) => void) & {
  q?: unknown[][]
  track?: (name: string, props?: OaProps) => void
}

/** Evento do OpenAnalytics. Antes de o oa.js carregar, vai para a fila que ele esvazia. */
export function oaTrack(name: string, props?: OaProps) {
  if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_OA_KEY) return
  const w = window as unknown as { oa?: Oa }
  if (!w.oa) {
    const stub: Oa = (...args) => {
      stub.q?.push(args)
    }
    stub.q = []
    w.oa = stub
  }
  if (typeof w.oa.track === "function") w.oa.track(name, props)
  else if (typeof w.oa === "function") w.oa("track", name, props)
}
