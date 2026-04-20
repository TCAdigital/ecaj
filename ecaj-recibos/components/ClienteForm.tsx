'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

type Cliente = {
  id: string
  nome: string
  cpfCnpj: string | null
  email: string
  telefone: string | null
  endereco: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
}

export default function ClienteForm() {
  const { data: session } = useSession()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    nome: '',
    cpfCnpj: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

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
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/clientes/${editingId}` : '/api/clientes'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setForm({
          nome: '',
          cpfCnpj: '',
          email: '',
          telefone: '',
          endereco: '',
          cidade: '',
          estado: '',
          cep: '',
        })
        setEditingId(null)
        await fetchClientes()
      }
    } catch (error) {
      console.error('Erro ao salvar cliente:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) {
    if (!confirm('Tem certeza que deseja deletar este cliente?')) return

    try {
      const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchClientes()
      }
    } catch (error) {
      console.error('Erro ao deletar cliente:', error)
    }
  }

  const handleEdit = (cliente: Cliente) => {
    setForm({
      nome: cliente.nome,
      cpfCnpj: cliente.cpfCnpj || '',
      email: cliente.email,
      telefone: cliente.telefone || '',
      endereco: cliente.endereco || '',
      cidade: cliente.cidade || '',
      estado: cliente.estado || '',
      cep: cliente.cep || '',
    })
    setEditingId(cliente.id)
  }

  return (
    <div className="space-y-6">
      {/* Formulário */}
      <div className="bg-white rounded-lg border border-secondary-200 p-6">
        <h2 className="text-xl font-bold text-secondary-900 mb-4">
          {editingId ? 'Editar Cliente' : 'Novo Cliente'}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nome"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="col-span-1 md:col-span-2 px-4 py-2 border border-secondary-300 rounded-lg bg-white"
            required
          />

          <input
            type="text"
            placeholder="CPF/CNPJ"
            value={form.cpfCnpj}
            onChange={(e) => setForm({ ...form, cpfCnpj: e.target.value })}
            className="px-4 py-2 border border-secondary-300 rounded-lg bg-white"
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="px-4 py-2 border border-secondary-300 rounded-lg bg-white"
            required
          />

          <input
            type="tel"
            placeholder="Telefone"
            value={form.telefone}
            onChange={(e) => setForm({ ...form, telefone: e.target.value })}
            className="px-4 py-2 border border-secondary-300 rounded-lg bg-white"
          />

          <input
            type="text"
            placeholder="Endereço"
            value={form.endereco}
            onChange={(e) => setForm({ ...form, endereco: e.target.value })}
            className="col-span-1 md:col-span-2 px-4 py-2 border border-secondary-300 rounded-lg bg-white"
          />

          <input
            type="text"
            placeholder="Cidade"
            value={form.cidade}
            onChange={(e) => setForm({ ...form, cidade: e.target.value })}
            className="px-4 py-2 border border-secondary-300 rounded-lg bg-white"
          />

          <input
            type="text"
            placeholder="Estado"
            value={form.estado}
            onChange={(e) => setForm({ ...form, estado: e.target.value })}
            className="px-4 py-2 border border-secondary-300 rounded-lg bg-white"
          />

          <input
            type="text"
            placeholder="CEP"
            value={form.cep}
            onChange={(e) => setForm({ ...form, cep: e.target.value })}
            className="px-4 py-2 border border-secondary-300 rounded-lg bg-white"
          />

          <div className="col-span-1 md:col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
            >
              {submitting ? 'Salvando...' : editingId ? 'Atualizar' : 'Cadastrar'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null)
                  setForm({
                    nome: '',
                    cpfCnpj: '',
                    email: '',
                    telefone: '',
                    endereco: '',
                    cidade: '',
                    estado: '',
                    cep: '',
                  })
                }}
                className="px-4 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Lista de Clientes */}
      <div className="bg-white rounded-lg border border-secondary-200 p-6">
        <h2 className="text-xl font-bold text-secondary-900 mb-4">Clientes Cadastrados</h2>

        {loading ? (
          <p className="text-secondary-600">Carregando...</p>
        ) : clientes.length === 0 ? (
          <p className="text-secondary-600">Nenhum cliente cadastrado</p>
        ) : (
          <div className="space-y-2">
            {clientes.map((cliente) => (
              <div
                key={cliente.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 border border-secondary-200 rounded-lg hover:bg-primary-50 transition"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-secondary-900 truncate">{cliente.nome}</h3>
                  <p className="text-sm text-secondary-600">{cliente.email}</p>
                  {cliente.telefone && <p className="text-sm text-secondary-600">{cliente.telefone}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(cliente)}
                    className="px-3 py-1 bg-primary-100 text-primary-600 hover:bg-primary-200 rounded text-sm font-medium transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(cliente.id)}
                    className="px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded text-sm font-medium transition"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
