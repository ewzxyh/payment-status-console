import type { Breadcrumb, ErrorEvent } from "@sentry/nextjs"

// A query string pode levar telefone ou nome; o erro só precisa do caminho.
const stripQuery = <T>(url: T): T =>
  typeof url === "string" ? (url.split(/[?#]/, 1)[0] as T) : url

// Opções comuns do cliente, servidor e edge (GlitchTip). O SDK coleta usuário,
// cookies, cabeçalhos, corpos e query por padrão: tudo desligado, sem dado pessoal.
export const sentryOptions = {
  tracesSampleRate: 0.05,
  dataCollection: {
    userInfo: false,
    cookies: false,
    httpHeaders: false,
    httpBodies: [],
    urlQueryParams: false,
    stackFrameVariables: false,
  },
  // O GlitchTip recebe erros e traces; o SDK 11 mandaria também logs e métricas.
  beforeSendLog: () => null,
  beforeSendMetric: () => null,
  sendClientReports: false,
  beforeBreadcrumb(breadcrumb: Breadcrumb) {
    if (breadcrumb.category === "console") return null
    const data = breadcrumb.data
    if (data) for (const key of ["url", "from", "to"]) if (key in data) data[key] = stripQuery(data[key])
    return breadcrumb
  },
  beforeSend(event: ErrorEvent) {
    delete event.user
    if (event.request) {
      event.request.url = stripQuery(event.request.url)
      delete event.request.query_string
      delete event.request.cookies
      delete event.request.headers
      delete event.request.data
    }
    return event
  },
}
