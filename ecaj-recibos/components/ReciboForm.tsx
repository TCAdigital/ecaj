'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import SignaturePad from './SignaturePad'

type Cliente = {
  id: string
  nome: string
  email: string
  telefone?: string
  cpfCnpj?: string
  endereco?: string
  cidade?: string
}

type Servico = {
  id: string
  descricao: string
  valor: string
}

export default function ReciboForm({ onSuccess }: { onSuccess: () => void }) {
  const { data: session } = useSession()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [selectedCliente, setSelectedCliente] = useState('')
  const [dataRecebimento, setDataRecebimento] = useState(new Date().toISOString().split('T')[0])
  const [servicos, setServicos] = useState<Servico[]>([{ id: '1', descricao: '', valor: '' }])
  const [outros, setOutros] = useState<Servico[]>([])
  const [assinatura, setAssinatura] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSignature, setShowSignature] = useState(false)

  useEffect(() => {
    fetchClientes()
  }, [])

  const fetchClientes = async () => {
    try {
      const res = await fetch('/api/clientes')
      if (res.ok) {
        const data = await res.json()
        setClientes(data)
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
    }
  }

  const handleAddServico = () => {
    setServicos([...servicos, { id: Date.now().toString(), descricao: '', valor: '' }])
  }

  const handleRemoveServico = (id: string) => {
    setServicos(servicos.filter(s => s.id !== id))
  }

  const handleAddOutro = () => {
    setOutros([...outros, { id: Date.now().toString(), descricao: '', valor: '' }])
  }

  const handleRemoveOutro = (id: string) => {
    setOutros(outros.filter(o => o.id !== id))
  }

  const handleUpdateServico = (id: string, campo: 'descricao' | 'valor', valor: string) => {
    setServicos(servicos.map(s => s.id === id ? { ...s, [campo]: valor } : s))
  }

  const handleUpdateOutro = (id: string, campo: 'descricao' | 'valor', valor: string) => {
    setOutros(outros.map(o => o.id === id ? { ...o, [campo]: valor } : o))
  }

  const calcularTotal = () => {
    const servicosTotal = servicos.reduce((sum, s) => sum + (parseFloat(s.valor) || 0), 0)
    const outrosTotal = outros.reduce((sum, o) => sum + (parseFloat(o.valor) || 0), 0)
    return servicosTotal + outrosTotal
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCliente) {
      alert('Selecione um cliente')
      return
    }

    if (servicos.filter(s => s.descricao).length === 0 && outros.filter(o => o.descricao).length === 0) {
      alert('Adicione pelo menos um serviço ou outro item')
      return
    }

    setLoading(true)

    try {
      const total = calcularTotal()
      
      const res = await fetch('/api/recibos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteId: selectedCliente,
          dataRecebimento,
          servicos: servicos.filter(s => s.descricao),
          outros: outros.filter(o => o.descricao),
          valorTotal: total,
          assinatura,
        }),
      })

      if (res.ok) {
        alert('Recibo criado com sucesso!')
        // Reset form
        setSelectedCliente('')
        setDataRecebimento(new Date().toISOString().split('T')[0])
        setServicos([{ id: '1', descricao: '', valor: '' }])
        setOutros([])
        setAssinatura(null)
        onSuccess()
      } else {
        alert('Erro ao criar recibo')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao criar recibo')
    } finally {
      setLoading(false)
    }
  }

  const total = calcularTotal()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-secondary-200 p-6">
        <h2 className="text-2xl font-bold text-secondary-900 mb-6">Criar Novo Recibo</h2>

        {/* Cliente */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Cliente *
          </label>
          <select
            value={selectedCliente}
            onChange={(e) => setSelectedCliente(e.target.value)}
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg bg-white text-secondary-900"
            required
          >
            <option value="">Selecione um cliente</option>
            {clientes.map(cliente => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Data */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Data de Recebimento *
          </label>
          <input
            type="date"
            value={dataRecebimento}
            onChange={(e) => setDataRecebimento(e.target.value)}
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg bg-white text-secondary-900"
            required
          />
        </div>

        {/* Serviços */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-secondary-900">Serviços</h3>
            <button
              type="button"
              onClick={handleAddServico}
              className="px-3 py-1 bg-primary-100 text-primary-600 hover:bg-primary-200 rounded text-sm font-medium transition"
            >
              + Adicionar
            </button>
          </div>
          
          <div className="space-y-3">
            {servicos.map(servico => (
              <div key={servico.id} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Descrição"
                  value={servico.descricao}
                  onChange={(e) => handleUpdateServico(servico.id, 'descricao', e.target.value)}
                  className="flex-1 px-4 py-2 border border-secondary-300 rounded-lg bg-white text-secondary-900"
                />
                <input
                  type="number"
                  placeholder="Valor"
                  step="0.01"
                  value={servico.valor}
                  onChange={(e) => handleUpdateServico(servico.id, 'valor', e.target.value)}
                  className="w-32 px-4 py-2 border border-secondary-300 rounded-lg bg-white text-secondary-900"
                />
                {servicos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveServico(servico.id)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded transition"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Outros */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-secondary-900">Outros</h3>
            <button
              type="button"
              onClick={handleAddOutro}
              className="px-3 py-1 bg-primary-100 text-primary-600 hover:bg-primary-200 rounded text-sm font-medium transition"
            >
              + Adicionar
            </button>
          </div>
          
          {outros.length > 0 && (
            <div className="space-y-3">
              {outros.map(outro => (
                <div key={outro.id} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Descrição"
                    value={outro.descricao}
                    onChange={(e) => handleUpdateOutro(outro.id, 'descricao', e.target.value)}
                    className="flex-1 px-4 py-2 border border-secondary-300 rounded-lg bg-white text-secondary-900"
                  />
                  <input
                    type="number"
                    placeholder="Valor"
                    step="0.01"
                    value={outro.valor}
                    onChange={(e) => handleUpdateOutro(outro.id, 'valor', e.target.value)}
                    className="w-32 px-4 py-2 border border-secondary-300 rounded-lg bg-white text-secondary-900"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveOutro(outro.id)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded transition"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total */}
        <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-secondary-900">Valor Total:</span>
            <span className="text-2xl font-bold text-primary-600">
              R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Assinatura */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setShowSignature(!showSignature)}
            className="w-full px-4 py-2 border-2 border-dashed border-primary-300 text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition"
          >
            {assinatura ? '✓ Assinatura Adicionada' : '✏️ Adicionar Assinatura Digital'}
          </button>

          {showSignature && (
            <div className="mt-4 p-4 bg-secondary-50 rounded-lg border border-secondary-200">
              <SignaturePad
                onSave={(sig) => {
                  setAssinatura(sig)
                  setShowSignature(false)
                }}
                onCancel={() => setShowSignature(false)}
              />
            </div>
          )}
        </div>

        {/* Botão Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Criando Recibo...' : '✅ Gerar Recibo'}
        </button>
      </form>
    </div>
  )
}
