'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

type Recibo = {
  id: string
  numero: number
  cliente: string
  clienteId: string
  dataRecebimento: string
  valorTotal: number
  criadoEm: string
  historico: Array<{
    acao: string
    descricao?: string
    criadoEm: string
  }>
}

export default function ReciboList() {
  const { data: session } = useSession()
  const [recibos, setRecibos] = useState<Recibo[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null)

  useEffect(() => {
    fetchRecibos()
  }, [])

  const fetchRecibos = async () => {
    try {
      const res = await fetch('/api/recibos')
      if (res.ok) {
        const data = await res.json()
        setRecibos(data)
      }
    } catch (error) {
      console.error('Erro ao buscar recibos:', error)
    } finally {
      setLoading(false)
    }
  }

  const generatePDFBlob = async (reciboId: string): Promise<{ blob: Blob, numero: number }> => {
    const res = await fetch(`/api/recibos/${reciboId}/pdf`)
    if (!res.ok) throw new Error('Erro ao buscar dados do PDF')
    
    const { html, numero } = await res.json()
    
    // Criar um container invisível para o HTML
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.top = '0'
    container.style.width = '800px' // Fixar largura em pixels para evitar cortes
    container.style.background = 'white'
    container.className = 'pdf-render-container'
    container.innerHTML = html
    document.body.appendChild(container)
    
    // Adicionar estilos de override para garantir que o PDF pareça correto e não corte
    const style = document.createElement('style')
    style.innerHTML = `
      .pdf-render-container .container { 
        width: 100% !important; 
        height: auto !important; 
        padding: 40px !important; 
        margin: 0 !important;
        box-shadow: none !important;
      }
      .pdf-render-container * {
        box-sizing: border-box !important;
      }
    `
    container.appendChild(style)
    
    // Pequena pausa para garantir renderização de fontes e estilos
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 800, // Forçar largura do canvas
    })
    
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    
    // Calcular proporção para preencher a largura do A4
    const imgWidth = pdfWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
    document.body.removeChild(container)
    
    return {
      blob: pdf.output('blob'),
      numero
    }
  }

  const handleDownloadPDF = async (reciboId: string) => {
    try {
      setGeneratingPdf(reciboId)
      const { blob, numero } = await generatePDFBlob(reciboId)
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `recibo-${numero.toString().padStart(4, '0')}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Erro ao baixar PDF:', error)
      alert('Erro ao gerar PDF. Tente novamente.')
    } finally {
      setGeneratingPdf(null)
    }
  }

  const handleSendWhatsApp = async (reciboId: string, recibo: Recibo) => {
    try {
      const clienteRes = await fetch(`/api/clientes/${recibo.clienteId}`)
      if (!clienteRes.ok) throw new Error('Cliente não encontrado')
      const clienteData = await clienteRes.json()
      
      const telefone = clienteData.telefone?.replace(/\D/g, '')
      
      if (!telefone) {
        alert('Cliente não possui telefone cadastrado')
        return
      }

      const mensagem = `Olá *${clienteData.nome}*!\n\nSeu recibo *#${recibo.numero.toString().padStart(4, '0')}* foi gerado com sucesso pela *ECAJ*.\n\n*Valor:* R$ ${recibo.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\nVocê pode visualizar e baixar o seu recibo clicando no link abaixo:\n${window.location.origin}/public/recibo/${reciboId}\n\nO PDF também foi enviado para o seu e-mail.`
      
      const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`
      window.open(url, '_blank')

      // Registrar envio no histórico
      await fetch(`/api/recibos/${reciboId}/historico`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'enviado_whatsapp',
          whatsappEnviadoPara: telefone,
        }),
      })

      await fetchRecibos()
    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error)
      alert('Erro ao preparar link do WhatsApp')
    }
  }

  const handleSendEmail = async (reciboId: string, recibo: Recibo) => {
    try {
      setGeneratingPdf(reciboId)
      
      const clienteRes = await fetch(`/api/clientes/${recibo.clienteId}`)
      if (!clienteRes.ok) throw new Error('Cliente não encontrado')
      const clienteData = await clienteRes.json()
      
      if (!clienteData.email) {
        alert('Cliente não possui e-mail cadastrado')
        return
      }

      // Gera o PDF real
      const { blob, numero } = await generatePDFBlob(reciboId)
      
      // Envia via API
      const formData = new FormData()
      formData.append('reciboId', reciboId)
      formData.append('email', clienteData.email)
      formData.append('nome', clienteData.nome)
      formData.append('numero', numero.toString().padStart(4, '0'))
      formData.append('valor', recibo.valorTotal.toString())
      formData.append('pdf', blob, `recibo-${numero}.pdf`)

      const res = await fetch('/api/email/send', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        alert('E-mail enviado com sucesso!')
        await fetchRecibos()
      } else {
        const errorData = await res.json()
        alert(`Erro ao enviar e-mail: ${errorData.details || errorData.error || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error)
      alert('Erro ao enviar e-mail')
    } finally {
      setGeneratingPdf(null)
    }
  }

  const handleDuplicate = async (reciboId: string) => {
    if (!confirm('Duplicar este recibo para o próximo mês?')) return

    try {
      const res = await fetch(`/api/recibos/${reciboId}/duplicate`, {
        method: 'POST',
      })

      if (res.ok) {
        alert('Recibo duplicado com sucesso!')
        await fetchRecibos()
      }
    } catch (error) {
      console.error('Erro ao duplicar:', error)
    }
  }

  const handleDelete = async (reciboId: string) => {
    if (!confirm('Tem certeza que deseja excluir este recibo? Esta ação não pode ser desfeita.')) return

    try {
      const res = await fetch(`/api/recibos/${reciboId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        alert('Recibo excluído com sucesso!')
        await fetchRecibos()
      } else {
        alert('Erro ao excluir recibo')
      }
    } catch (error) {
      console.error('Erro ao excluir:', error)
    }
  }

  const filteredRecibos = recibos.filter(recibo => 
    recibo.cliente.toLowerCase().includes(searchTerm.toLowerCase()) || 
    recibo.numero.toString().includes(searchTerm)
  )

  if (loading) {
    return <div className="text-center py-12 text-secondary-600">Carregando recibos...</div>
  }

  if (recibos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-600 mb-4">Nenhum recibo criado ainda</p>
        <p className="text-sm text-secondary-500">Crie um novo recibo para começar</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Barra de Pesquisa */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Pesquisar por cliente ou número do recibo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-secondary-200 rounded-2xl text-secondary-900 placeholder-secondary-400 shadow-sm focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
        />
      </div>

      {filteredRecibos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-secondary-100 shadow-sm">
          <p className="text-secondary-600 mb-2">Nenhum recibo encontrado</p>
          {searchTerm && <p className="text-sm text-secondary-400">Tente buscar por termos diferentes ou número completo.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredRecibos.map(recibo => (
            <div key={recibo.id} className="glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg animate-slide-up">
              {/* Header do Recibo */}
              <div className="flex items-stretch">
                <button
                  onClick={() => setExpandedId(expandedId === recibo.id ? null : recibo.id)}
                  className="flex-1 p-5 hover:bg-primary-50/50 transition-colors text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-r border-secondary-100"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-bold px-2.5 py-1 bg-primary-100 text-primary-700 rounded-md">
                        #{recibo.numero.toString().padStart(4, '0')}
                      </span>
                      <span className="font-semibold text-secondary-900 truncate">{recibo.cliente}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-secondary-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(recibo.criadoEm).toLocaleDateString('pt-BR')}
                      
                      {recibo.historico.length > 1 && (
                        <>
                          <span className="w-1 h-1 bg-secondary-300 rounded-full"></span>
                          <span className="text-green-600 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Enviado
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center sm:text-right gap-4">
                    <div>
                      <p className="text-xs text-secondary-500 uppercase font-semibold mb-0.5">Total</p>
                      <p className="text-lg font-bold text-primary-600">
                        R$ {recibo.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className={`w-8 h-8 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-500 transition-transform duration-300 ${expandedId === recibo.id ? 'rotate-180 bg-primary-100 text-primary-600' : ''}`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => handleDelete(recibo.id)}
                  className="px-4 flex items-center justify-center text-secondary-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  title="Excluir recibo"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Conteúdo Expandido */}
              <div className={`transition-all duration-300 ease-in-out origin-top ${expandedId === recibo.id ? 'scale-y-100 opacity-100 max-h-[500px]' : 'scale-y-0 opacity-0 max-h-0'}`}>
                <div className="border-t border-secondary-100 bg-secondary-50/50 p-5 space-y-5">
                  
                  {/* Ações */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button
                      onClick={() => handleDownloadPDF(recibo.id)}
                      disabled={!!generatingPdf}
                      className="flex flex-col items-center justify-center p-3 bg-white border border-secondary-200 text-secondary-700 hover:border-primary-300 hover:text-primary-600 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow disabled:opacity-50"
                    >
                      {generatingPdf === recibo.id ? (
                        <div className="w-5 h-5 mb-1 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                      PDF
                    </button>
                    <button
                      onClick={() => handleSendWhatsApp(recibo.id, recibo)}
                      className="flex flex-col items-center justify-center p-3 bg-[#25D366]/10 border border-[#25D366]/20 text-[#128C7E] hover:bg-[#25D366]/20 rounded-xl text-sm font-medium transition-all shadow-sm"
                    >
                      <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                    </svg>
                    WhatsApp
                  </button>
                  <button
                    onClick={() => handleSendEmail(recibo.id, recibo)}
                    disabled={!!generatingPdf}
                    className="flex flex-col items-center justify-center p-3 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-xl text-sm font-medium transition-all shadow-sm disabled:opacity-50"
                  >
                    {generatingPdf === recibo.id ? (
                      <div className="w-5 h-5 mb-1 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    )}
                    E-mail
                  </button>
                  <button
                    onClick={() => handleDuplicate(recibo.id)}
                    className="flex flex-col items-center justify-center p-3 bg-white border border-secondary-200 text-secondary-700 hover:border-purple-300 hover:text-purple-600 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow"
                  >
                    <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Duplicar
                  </button>
                </div>

                {/* Histórico */}
                {recibo.historico.length > 0 && (
                  <div className="pt-2">
                    <h4 className="text-xs font-bold text-secondary-400 uppercase tracking-wider mb-3">Histórico de Atividades</h4>
                    <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:ml-[9px] md:before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-secondary-200 before:to-transparent">
                      {recibo.historico.sort((a,b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()).map((item, idx) => (
                        <div key={idx} className="relative flex items-center gap-4">
                          <div className="h-4 w-4 md:h-5 md:w-5 rounded-full bg-white border-2 border-secondary-200 flex items-center justify-center z-10 shadow-sm shrink-0">
                            <div className={`h-1.5 w-1.5 rounded-full ${item.acao === 'criado' ? 'bg-primary-500' : 'bg-green-500'}`} />
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold text-secondary-800">
                              {item.acao === 'criado' && 'Criado'}
                              {item.acao === 'enviado_email' && 'E-mail enviado'}
                              {item.acao === 'enviado_whatsapp' && 'WhatsApp enviado'}
                              {item.acao === 'duplicado' && 'Duplicado'}
                            </span>
                            <span className="text-secondary-500 text-xs ml-2">
                              {new Date(item.criadoEm).toLocaleString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          ))}
        </div>
      )}
    </div>
  )
}
