'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email ou senha incorretos')
      } else if (result?.ok) {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">ECAJ</h1>
          <p className="text-secondary-600">Sistema de Recibos</p>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-lg shadow-lg p-8 animate-slide-in">
          <h2 className="text-2xl font-bold text-secondary-900 mb-6">Acesso</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg bg-white text-secondary-900 placeholder-secondary-500 transition hover:border-primary-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg bg-white text-secondary-900 placeholder-secondary-500 transition hover:border-primary-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-secondary-600 text-sm mt-6">
            Entre em contato com o administrador para criar sua conta
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-secondary-500 text-xs mt-8">
          © 2024 ECAJ - Assessoria Fiscal e Contábil
        </p>
      </div>
    </div>
  )
}
