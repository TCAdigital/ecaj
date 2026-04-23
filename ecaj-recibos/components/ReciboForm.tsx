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
    <div className="max-w-4xl mx-auto space-y-8">
      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-secondary-900 mb-8 flex items-center gap-2">
          <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Emissão de Recibo
        </h2>

        {clientes.length === 0 ? (
          <div className="text-center p-12 bg-secondary-50 rounded-2xl border-2 border-dashed border-secondary-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <svg className="w-8 h-8 text-secondary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-secondary-900 mb-2">Nenhum cliente cadastrado</h3>
            <p className="text-secondary-500 mb-6 max-w-sm mx-auto">
              Você precisa cadastrar pelo menos um cliente antes de gerar um novo recibo.
            </p>
            <button
              type="button"
              onClick={() => {
                // Aqui poderíamos ter uma forma de trocar a tab se estivéssemos num contexto superior
                // Mas por enquanto, vamos apenas avisar.
                alert('Acesse a aba "Clientes" para cadastrar.')
              }}
              className="px-6 py-2 bg-primary-600 text-white rounded-xl font-semibold shadow-md shadow-primary-600/20 hover:bg-primary-700 transition"
            >
              Ir para Clientes
            </button>
          </div>
        ) : (
          <>
            {/* Cliente & Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5 ml-1">
              Cliente
            </label>
            <select
              value={selectedCliente}
              onChange={(e) => setSelectedCliente(e.target.value)}
              className="w-full px-4 py-2.5 border border-secondary-200 rounded-xl bg-white/50 focus:bg-white text-secondary-900 outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              required
            >
              <option value="">Selecione um cliente cadastrado</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5 ml-1">
              Data de Emissão
            </label>
            <input
              type="date"
              value={dataRecebimento}
              onChange={(e) => setDataRecebimento(e.target.value)}
              className="w-full px-4 py-2.5 border border-secondary-200 rounded-xl bg-white/50 focus:bg-white text-secondary-900 outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              required
            />
          </div>
        </div>

        <div className="w-full h-px bg-secondary-200 my-8"></div>

        {/* Serviços */}
        <div className="mb-8 pl-4 border-l-2 border-primary-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-secondary-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs">1</span>
              Serviços Prestados
            </h3>
            <button
              type="button"
              onClick={handleAddServico}
              className="px-4 py-1.5 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-lg text-sm font-semibold transition"
            >
              + Novo Item
            </button>
          </div>
          
          <div className="space-y-3">
            {servicos.map((servico, index) => (
              <div key={servico.id} className="flex gap-3 items-center group">
                <span className="text-secondary-400 font-medium text-sm w-4">{index + 1}.</span>
                <input
                  type="text"
                  placeholder="Descrição do Serviço"
                  value={servico.descricao}
                  onChange={(e) => handleUpdateServico(servico.id, 'descricao', e.target.value)}
                  className="flex-1 px-4 py-2 border border-secondary-200 rounded-lg bg-white/50 focus:bg-white text-secondary-900 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-500 text-sm font-medium">R$</span>
                  <input
                    type="number"
                    placeholder="0,00"
                    step="0.01"
                    min="0"
                    value={servico.valor}
                    onChange={(e) => handleUpdateServico(servico.id, 'valor', e.target.value)}
                    className="w-32 pl-9 pr-4 py-2 border border-secondary-200 rounded-lg bg-white/50 focus:bg-white text-secondary-900 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                  />
                </div>
                {servicos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveServico(servico.id)}
                    className="p-2 text-secondary-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                    title="Remover"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Outros */}
        <div className="mb-8 pl-4 border-l-2 border-secondary-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-secondary-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-secondary-100 text-secondary-600 flex items-center justify-center text-xs">2</span>
              Taxas & Outros
            </h3>
            <button
              type="button"
              onClick={handleAddOutro}
              className="px-4 py-1.5 bg-secondary-100 text-secondary-700 hover:bg-secondary-200 rounded-lg text-sm font-semibold transition"
            >
              + Novo Item
            </button>
          </div>
          
          {outros.length > 0 ? (
            <div className="space-y-3">
              {outros.map((outro, index) => (
                <div key={outro.id} className="flex gap-3 items-center group">
                  <span className="text-secondary-400 font-medium text-sm w-4">{index + 1}.</span>
                  <input
                    type="text"
                    placeholder="Descrição da Taxa"
                    value={outro.descricao}
                    onChange={(e) => handleUpdateOutro(outro.id, 'descricao', e.target.value)}
                    className="flex-1 px-4 py-2 border border-secondary-200 rounded-lg bg-white/50 focus:bg-white text-secondary-900 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-500 text-sm font-medium">R$</span>
                    <input
                      type="number"
                      placeholder="0,00"
                      step="0.01"
                      min="0"
                      value={outro.valor}
                      onChange={(e) => handleUpdateOutro(outro.id, 'valor', e.target.value)}
                      className="w-32 pl-9 pr-4 py-2 border border-secondary-200 rounded-lg bg-white/50 focus:bg-white text-secondary-900 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveOutro(outro.id)}
                    className="p-2 text-secondary-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-secondary-500">Nenhuma taxa extra informada.</p>
          )}
        </div>

        {/* Total & Assinatura */}
        <div className="bg-secondary-50 rounded-2xl p-6 border border-secondary-200 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-secondary-700 mb-2">Assinatura</label>
              <button
                type="button"
                onClick={() => setShowSignature(!showSignature)}
                className={`w-full py-3 px-4 border-2 border-dashed rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  assinatura 
                  ? 'border-green-300 bg-green-50 text-green-700' 
                  : 'border-secondary-300 hover:border-primary-400 bg-white text-secondary-600 hover:text-primary-600'
                }`}
              >
                {assinatura ? (
                  <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Assinatura Confirmada</>
                ) : (
                  <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg> Desenhar Assinatura</>
                )}
              </button>
            </div>
            
            <div className="bg-white px-6 py-4 rounded-xl border border-secondary-200 shadow-sm min-w-[250px] text-right">
              <span className="text-secondary-500 font-medium text-sm block mb-1">Valor Total a Receber</span>
              <span className="text-3xl font-bold tracking-tight text-primary-600">
                R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {showSignature && (
            <div className="mt-4 p-5 bg-white rounded-xl border border-secondary-200 shadow-sm animate-slide-in">
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

        {/* Botões */}
        <div className="flex justify-end gap-4 border-t border-secondary-200 pt-6">
          <button
            type="button"
            onClick={onSuccess}
            className="px-6 py-3 font-semibold text-secondary-600 hover:bg-secondary-100 rounded-xl transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-md shadow-primary-600/20 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Processando...</>
            ) : (
              <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Gerar Recibo Oficial</>
            )}
          </button>
        </div>
        </>
        )}
      </form>
    </div>
  )
}
