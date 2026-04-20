'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import NavBar from '@/components/NavBar'
import ReciboList from '@/components/ReciboList'
import ClienteForm from '@/components/ClienteForm'

type Tab = 'recibos' | 'clientes' | 'novo-recibo'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('recibos')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
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
    <div className="min-h-screen bg-white">
      <NavBar />

      <main className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-secondary-200">
          <button
            onClick={() => setActiveTab('recibos')}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === 'recibos'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-secondary-600 hover:text-secondary-900'
            }`}
          >
            📋 Recibos
          </button>
          <button
            onClick={() => setActiveTab('novo-recibo')}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === 'novo-recibo'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-secondary-600 hover:text-secondary-900'
            }`}
          >
            ➕ Novo Recibo
          </button>
          <button
            onClick={() => setActiveTab('clientes')}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === 'clientes'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-secondary-600 hover:text-secondary-900'
            }`}
          >
            👥 Clientes
          </button>
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {activeTab === 'recibos' && <ReciboList />}
          {activeTab === 'novo-recibo' && <ReciboForm onSuccess={() => setActiveTab('recibos')} />}
          {activeTab === 'clientes' && <ClienteForm />}
        </div>
      </main>
    </div>
  )
}
