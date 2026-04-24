import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PublicReciboClient from '@/components/PublicReciboClient'

export default async function PublicReciboPage({ params }: { params: { id: string } }) {
  const recibo = await prisma.recibos.findUnique({
    where: { id: params.id },
    include: { clienteRelacao: true },
  })

  if (!recibo) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl shadow-secondary-200/50 overflow-hidden border border-secondary-100">
        <div className="bg-primary-600 p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white"/>
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Seu Recibo está Pronto!</h1>
          <p className="text-primary-100 mt-2">Emitido por ECAJ Assessoria Contábil</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center pb-6 border-bottom border-secondary-100">
            <div>
              <p className="text-xs text-secondary-400 uppercase font-bold tracking-wider">Número do Recibo</p>
              <p className="text-lg font-bold text-secondary-900">#{recibo.numero.toString().padStart(4, '0')}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-secondary-400 uppercase font-bold tracking-wider">Valor Total</p>
              <p className="text-2xl font-black text-primary-600">
                R$ {recibo.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="bg-secondary-50 rounded-2xl p-6 border border-secondary-100">
            <p className="text-sm text-secondary-600 leading-relaxed text-center italic">
              "Declaramos ter recebido de <strong>{recibo.clienteRelacao.nome}</strong> a importância de 
              R$ {recibo.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}, referente à prestação de serviços contábeis."
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <PublicReciboClient recibo={recibo} />
          </div>
        </div>

        <div className="bg-secondary-50 p-6 text-center border-t border-secondary-100">
          <p className="text-xs text-secondary-400 font-medium uppercase tracking-widest">ECAJ Assessoria Contábil</p>
        </div>
      </div>
      
      <p className="mt-8 text-secondary-400 text-xs font-medium">
        Documento seguro gerado por ECAJ Sistema de Recibos.
      </p>
    </div>
  )
}
