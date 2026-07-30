'use client'

import { useState } from 'react'
import { gerarPdfRecibo, baixarBlob } from '@/lib/pdf'

type Props = {
  recibo: { id: string; numero: number }
}

export default function PublicReciboClient({ recibo }: Props) {
  const [generating, setGenerating] = useState(false)

  const handleDownload = async () => {
    try {
      setGenerating(true)
      // Download local: não passa pelo servidor, então cabe uma escala maior.
      const { blob } = await gerarPdfRecibo(`/api/public/recibo/${recibo.id}/pdf-data`, { scale: 1.5 })
      baixarBlob(blob, `recibo-${recibo.numero.toString().padStart(4, '0')}.pdf`)
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('Erro ao gerar PDF. Tente novamente.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={generating}
      className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-6 rounded-2xl transition-all text-center flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 disabled:opacity-50"
    >
      {generating ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )}
      Baixar Recibo em PDF
    </button>
  )
}
