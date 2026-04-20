import type { Metadata } from 'next'
import { SessionProvider } from 'next-auth/react'
import './globals.css'

export const metadata: Metadata = {
  title: 'ECAJ - Sistema de Recibos',
  description: 'Sistema de gerenciamento de recibos',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-white text-secondary-900 font-sans antialiased">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
