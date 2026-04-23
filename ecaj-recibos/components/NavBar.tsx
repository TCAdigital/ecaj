'use client'

import { useSession, signOut } from 'next-auth/react'

export default function NavBar() {
  const { data: session } = useSession()

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-secondary-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-md shadow-primary-600/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white"/>
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-secondary-900 tracking-tight leading-none">ECAJ</h1>
            <p className="text-xs text-secondary-500 font-medium hidden md:block mt-0.5">Gestão de Recibos</p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3 pr-4 border-r border-secondary-200">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
              {session?.user?.name?.[0] || session?.user?.email?.[0].toUpperCase() || 'A'}
            </div>
            <span className="text-sm font-medium text-secondary-700 hidden sm:block">
              {session?.user?.name || session?.user?.email}
            </span>
          </div>
          <button
            onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
            className="text-sm font-medium text-secondary-500 hover:text-red-500 transition-colors flex items-center gap-2"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  )
}
