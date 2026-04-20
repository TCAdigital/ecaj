'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

type Recibo = {
  id: string
  numero: number
  cliente: string
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

  const handleDownloadPDF = async (reciboId: string) => {
    try {
      const res = await fetch(`/api/recibos/${reciboId}/pdf`)
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `recibo-${reciboId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Erro ao baixar PDF:', error)
      alert('Erro ao baixar PDF')
    }
  }

  const handleSendWhatsApp = async (reciboId: string, cliente: Recibo) => {
    try {
      const clienteData = await fetch(`/api/clientes/${cliente.id}`).then(r => r.json())
      const telefone = clienteData.telefone?.replace(/\D/g, '')
      
      if (!telefone) {
        alert('Cliente não possui telefone cadastrado')
        return
      }

      const mensagem = `Olá ${clienteData.nome}! 👋\n\nSeu recibo #${cliente.numero} foi gerado com sucesso!\n\nValor: R$ ${cliente.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\nClique aqui para baixar: [PDF em anexo]`
      
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
    }
  }

  const handleSendEmail = async (reciboId: string, cliente: Recibo) => {
    try {
      // Pega dados do cliente
      const clienteData = await fetch(`/api/clientes/${cliente.id}`).then(r => r.json())
      
      if (!clienteData.email) {
        alert('Cliente não possui e-mail cadastrado')
        return
      }

      // Pega o PDF
      const pdfRes = await fetch(`/api/recibos/${reciboId}/pdf`)
      const pdfBlob = await pdfRes.blob()
      
      // Envia via API
      const formData = new FormData()
      formData.append('reciboId', reciboId)
      formData.append('email', clienteData.email)
      formData.append('nome', clienteData.nome)
      formData.append('numero', cliente.numero.toString())
      formData.append('valor', cliente.valorTotal.toString())
      formData.append('pdf', pdfBlob, `recibo-${cliente.numero}.pdf`)

      const res = await fetch('/api/email/send', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        alert('E-mail enviado com sucesso!')
        await fetchRecibos()
      } else {
        alert('Erro ao enviar e-mail')
      }
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error)
      alert('Erro ao enviar e-mail')
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
    <div className="space-y-4">
      {recibos.map(recibo => (
        <div key={recibo.id} className="bg-white border border-secondary-200 rounded-lg overflow-hidden">
          {/* Header do Recibo */}
          <button
            onClick={() => setExpandedId(expandedId === recibo.id ? null : recibo.id)}
            className="w-full p-4 hover:bg-primary-50 transition text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-primary-600">#{recibo.numero}</span>
                  <span className="font-semibold text-secondary-900">{recibo.cliente}</span>
                </div>
                <p className="text-sm text-secondary-600 mt-1">
                  {new Date(recibo.criadoEm).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-primary-600">
                  R$ {recibo.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <span className={expandedId === recibo.id ? 'rotate-180' : ''}>▼</span>
              </div>
            </div>
          </button>

          {/* Conteúdo Expandido */}
          {expandedId === recibo.id && (
            <div className="border-t border-secondary-200 p-4 space-y-4">
              {/* Histórico */}
              {recibo.historico.length > 0 && (
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-2">📋 Histórico</h4>
                  <div className="space-y-2">
                    {recibo.historico.map((item, idx) => (
                      <div key={idx} className="text-sm text-secondary-600">
                        <span className="font-medium">
                          {item.acao === 'criado' && '✅ Criado'}
                          {item.acao === 'enviado_email' && '📧 Enviado por e-mail'}
                          {item.acao === 'enviado_whatsapp' && '💬 Enviado por WhatsApp'}
                          {item.acao === 'duplicado' && '📋 Duplicado'}
                        </span>
                        {' em '} {new Date(item.criadoEm).toLocaleString('pt-BR')}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-secondary-200">
                <button
                  onClick={() => handleDownloadPDF(recibo.id)}
                  className="flex-1 min-w-[120px] px-3 py-2 bg-primary-100 text-primary-600 hover:bg-primary-200 rounded-lg text-sm font-medium transition"
                >
                  📥 PDF
                </button>
                <button
                  onClick={() => handleSendWhatsApp(recibo.id, recibo)}
                  className="flex-1 min-w-[120px] px-3 py-2 bg-green-100 text-green-600 hover:bg-green-200 rounded-lg text-sm font-medium transition"
                >
                  💬 WhatsApp
                </button>
                <button
                  onClick={() => handleSendEmail(recibo.id, recibo)}
                  className="flex-1 min-w-[120px] px-3 py-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg text-sm font-medium transition"
                >
                  📧 E-mail
                </button>
                <button
                  onClick={() => handleDuplicate(recibo.id)}
                  className="flex-1 min-w-[120px] px-3 py-2 bg-purple-100 text-purple-600 hover:bg-purple-200 rounded-lg text-sm font-medium transition"
                >
                  📋 Duplicar
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
