'use client'

import { useState } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

type Props = {
  recibo: any
}

export default function PublicReciboClient({ recibo }: Props) {
  const [generating, setGenerating] = useState(false)

  const handleDownload = async () => {
    try {
      setGenerating(true)
      const res = await fetch(`/api/recibos/${recibo.id}/pdf`) // Usando a mesma API interna (mas ela requer login!)
      // ESPERE: a API de PDF requer login. Preciso de uma API pública ou passar o HTML via props.
      
      // Melhor: a página pública já tem acesso ao recibo. 
      // Mas o HTML complexo está no servidor.
      
      // Vamos usar uma abordagem mais simples: a página pública vai buscar o HTML 
      // de uma nova rota pública.
      
      const resHtml = await fetch(`/api/public/recibo/${recibo.id}/pdf-data`)
      const { html } = await resHtml.json()
      
      const container = document.createElement('div')
      container.style.position = 'absolute'
      container.style.left = '-9999px'
      container.style.width = '800px'
      container.innerHTML = html
      document.body.appendChild(container)
      
      const style = document.createElement('style')
      style.innerHTML = `
        .pdf-render-container .container { width: 100% !important; padding: 40px !important; margin: 0 !important; }
      `
      container.appendChild(style)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const canvas = await html2canvas(container, { scale: 1.5, width: 800 })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const imgHeight = (canvas.height * pdfWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight)
      pdf.save(`recibo-${recibo.numero.toString().padStart(4, '0')}.pdf`)
      
      document.body.removeChild(container)
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
