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
    <div className="min-h-screen bg-secondary-50 relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Decorativo Abstract */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-300 opacity-20 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary-500 opacity-10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Otimizado */}
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary-600/30">
            {/* SVG Logo Placeholder ECAJ */}
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white"/>
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-secondary-900 tracking-tight">ECAJ</h1>
          <p className="text-secondary-500 font-medium tracking-wide text-sm mt-1 uppercase">Assessoria Contábil</p>
        </div>

        {/* Card de Login Premium */}
        <div className="glass-panel rounded-2xl p-8 sm:p-10 animate-slide-in">
          <h2 className="text-xl font-semibold text-secondary-900 mb-6 font-sans">Acesso ao Sistema</h2>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5 ml-1">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ecaj.escritorio@hotmail.com"
                className="w-full px-4 py-3 border border-secondary-200 rounded-xl bg-white/50 focus:bg-white text-secondary-900 placeholder-secondary-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5 ml-1">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-secondary-200 rounded-xl bg-white/50 focus:bg-white text-secondary-900 placeholder-secondary-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-primary-600/20 hover:shadow-lg hover:shadow-primary-600/30 mt-2"
            >
              {loading ? 'Acessando...' : 'Entrar na Plataforma'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-secondary-100 text-center">
            <p className="text-secondary-500 text-sm">
              Área restrita à equipe ECAJ.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-secondary-400 text-xs mt-8 font-medium">
          © {new Date().getFullYear()} ECAJ. Desenvolvido com Antigravity.
        </p>
      </div>
    </div>
  )
}

