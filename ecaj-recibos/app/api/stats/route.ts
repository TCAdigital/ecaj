import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { startOfMonth, endOfMonth } from 'date-fns'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    // Buscar todos os recibos do usuário no mês atual
    const recibosMes = await prisma.recibos.findMany({
      where: {
        userId: session.user.id,
        criadoEm: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      select: {
        valorTotal: true,
      },
    })

    const totalValor = recibosMes.reduce((acc, r) => acc + r.valorTotal, 0)
    const totalQuantidade = recibosMes.length

    return NextResponse.json({
      totalValor,
      totalQuantidade,
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 })
  }
}
