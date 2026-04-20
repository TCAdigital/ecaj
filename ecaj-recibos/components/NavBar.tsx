'use client'

import { useSession, signOut } from 'next-auth/react'

export default function NavBar() {
  const { data: session } = useSession()

  return (
    <nav className="bg-white border-b border-secondary-200">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-primary-600">ECAJ</h1>
          <p className="text-sm text-secondary-600 hidden md:block">Sistema de Recibos</p>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-secondary-600">
            {session?.user?.name || session?.user?.email}
          </span>
          <button
            onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition text-sm"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  )
}
