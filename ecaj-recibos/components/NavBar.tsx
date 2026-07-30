'use client'

import { useSession, signOut } from 'next-auth/react'
import Logo from './Logo'

export default function NavBar() {
  const { data: session } = useSession()

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-secondary-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <Logo tamanho="sm" />

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
