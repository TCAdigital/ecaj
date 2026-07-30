'use client'

import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

type Opcoes = {
  /**
   * Escala do html2canvas. 1.0 mantém o PDF pequeno o suficiente para ser
   * enviado como anexo pela API sem estourar o limite de payload da Vercel.
   * Só aumente em downloads locais, que não passam pelo servidor.
   */
  scale?: number
}

const LARGURA_RENDER = 800

/**
 * Renderiza o HTML do recibo num container invisível e converte para PDF A4.
 * Usado pelo dashboard (download e envio por e-mail) e pela página pública.
 */
export async function gerarPdfDeHtml(html: string, { scale = 1.0 }: Opcoes = {}): Promise<Blob> {
  const container = document.createElement('div')
  container.className = 'pdf-render-wrapper'
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.style.width = `${LARGURA_RENDER}px`
  container.style.background = 'white'
  container.innerHTML = html

  const style = document.createElement('style')
  style.innerHTML = `
    .pdf-render-wrapper .container {
      width: 100% !important;
      height: auto !important;
      padding: 40px !important;
      margin: 0 !important;
      box-shadow: none !important;
    }
    .pdf-render-wrapper * { box-sizing: border-box !important; }
  `
  container.appendChild(style)
  document.body.appendChild(container)

  try {
    // Pausa para garantir que fontes, logo e estilos terminem de carregar.
    await new Promise((resolve) => setTimeout(resolve, 800))

    const canvas = await html2canvas(container, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: LARGURA_RENDER,
    })

    // JPEG a 70% reduz drasticamente o tamanho do anexo (evita erro 413).
    const imgData = canvas.toDataURL('image/jpeg', 0.7)
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true })

    const imgWidth = pdf.internal.pageSize.getWidth()
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight)

    return pdf.output('blob')
  } finally {
    document.body.removeChild(container)
  }
}

/**
 * Busca o HTML do recibo na API indicada e devolve o PDF pronto.
 * `endpoint` permite usar tanto a rota autenticada quanto a pública.
 */
export async function gerarPdfRecibo(
  endpoint: string,
  opcoes?: Opcoes
): Promise<{ blob: Blob; numero: number }> {
  const res = await fetch(endpoint)
  if (!res.ok) throw new Error('Erro ao buscar dados do PDF')

  const { html, numero } = await res.json()
  const blob = await gerarPdfDeHtml(html, opcoes)

  return { blob, numero }
}

/** Dispara o download do PDF no browser. */
export function baixarBlob(blob: Blob, nomeArquivo: string) {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nomeArquivo
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}
