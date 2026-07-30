import prisma from '@/lib/prisma'
import { buildReciboHtml } from '@/lib/reciboTemplate'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Versão pública (sem login) do HTML do recibo, usada pelo link enviado ao
 * cliente. Acesso é por posse do id do recibo — mesmo template da rota interna.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recibo = await prisma.recibos.findUnique({
      where: { id: params.id },
      include: { clienteRelacao: true },
    })

    if (!recibo) {
      return NextResponse.json({ error: 'Recibo não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      html: buildReciboHtml(recibo),
      numero: recibo.numero,
    })
  } catch (error) {
    console.error('Erro ao buscar dados do recibo público:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
