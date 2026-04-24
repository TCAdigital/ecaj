import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as any

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const recibo = await prisma.recibos.findUnique({
      where: { id: params.id },
    })

    if (!recibo) {
      return NextResponse.json({ error: 'Recibo não encontrado' }, { status: 404 })
    }

    if (recibo.userId !== session.user.id) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    await prisma.recibos.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar recibo:', error)
    return NextResponse.json({ error: 'Erro ao deletar recibo' }, { status: 500 })
  }
}
