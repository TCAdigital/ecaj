'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import NavBar from '@/components/NavBar'
import ReciboList from '@/components/ReciboList'
import ClienteForm from '@/components/ClienteForm'
import ReciboForm from '@/components/ReciboForm'

type Tab = 'recibos' | 'clientes' | 'novo-recibo'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('recibos')
  const [stats, setStats] = useState({ totalValor: 0, totalQuantidade: 0 })

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    } else if (status === 'authenticated') {
      fetchStats()
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-secondary-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-secondary-50/50">
      <NavBar />

      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
        {/* Header / Boas Vindas */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Olá, {session?.user?.name || 'Administrador'}</h1>
            <p className="text-secondary-500">Gerencie seus clientes e emissões de recibos.</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white px-4 py-2 rounded-xl border border-secondary-200 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-secondary-500 uppercase font-bold tracking-wider">Total do Mês</p>
                <p className="text-lg font-bold text-secondary-900">
                  R$ {stats.totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl border border-secondary-200 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-secondary-500 uppercase font-bold tracking-wider">Recibos</p>
                <p className="text-lg font-bold text-secondary-900">{stats.totalQuantidade}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Tabs / Navegação */}
        <div className="flex bg-secondary-100 p-1.5 rounded-xl w-fit mb-8 shadow-inner">
          <button
            onClick={() => setActiveTab('recibos')}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'recibos'
                ? 'bg-white text-secondary-900 shadow-sm'
                : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-200/50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Recibos
          </button>
          <button
            onClick={() => setActiveTab('novo-recibo')}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'novo-recibo'
                ? 'bg-white text-secondary-900 shadow-sm'
                : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-200/50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Novo Recibo
          </button>
          <button
            onClick={() => setActiveTab('clientes')}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'clientes'
                ? 'bg-white text-secondary-900 shadow-sm'
                : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-200/50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5V10a2 2 0 00-2-2h-3l-2.5-3.5a1 1 0 00-1.6 0L8 8H5a2 2 0 00-2 2v10h5M8 20v-5h8v5M12 11h.01" />
            </svg>
            Clientes
          </button>
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {activeTab === 'recibos' && <ReciboList />}
          {activeTab === 'novo-recibo' && (
            <ReciboForm 
              onSuccess={() => {
                setActiveTab('recibos')
                fetchStats() // Atualizar estatísticas após criar novo
              }} 
            />
          )}
          {activeTab === 'clientes' && <ClienteForm />}
        </div>
        
        <div className="text-center pt-8">
          <p className="text-[10px] text-secondary-300 uppercase tracking-widest font-bold">Sistema ECAJ • Versão 1.1 • Diagnóstico de E-mail Ativo</p>
        </div>
      </main>
    </div>
  )
}
