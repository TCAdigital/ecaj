/**
 * Helpers de formatação e sanitização usados na geração de recibos (HTML/PDF e e-mail).
 */

/** Escapa texto vindo do banco antes de interpolar em HTML. */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Converte para número, tratando string, null e valores inválidos como 0. */
export function toNumber(value: unknown): number {
  const n = typeof value === 'number' ? value : parseFloat(String(value ?? ''))
  return Number.isFinite(n) ? n : 0
}

/** Formata um valor monetário no padrão pt-BR, sempre com 2 casas. */
export function formatBRL(value: unknown): string {
  return toNumber(value).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Formata data para dd/mm/aaaa.
 * `dataRecebimento` é gravado como string "AAAA-MM-DD"; usar `new Date()` nela
 * a interpreta como UTC e desloca o dia em fusos negativos (Brasil).
 */
export function formatDateBR(value: string | Date | null | undefined): string {
  if (!value) return ''

  if (typeof value === 'string') {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (match) {
      const [, ano, mes, dia] = match
      return `${dia}/${mes}/${ano}`
    }
  }

  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('pt-BR')
}

/**
 * Devolve a assinatura apenas se for um data URL de imagem válido.
 * Impede que conteúdo arbitrário do campo `assinatura` escape para o atributo src.
 */
export function safeDataImage(value: string | null | undefined): string {
  if (!value) return ''
  return /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=\s]+$/.test(value) ? value : ''
}
