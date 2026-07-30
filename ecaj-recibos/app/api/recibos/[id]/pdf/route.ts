import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { buildReciboHtml } from '@/lib/reciboTemplate'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Retorna o HTML do recibo. O PDF em si é montado no browser
 * (html2canvas + jsPDF) — veja `lib/pdf.ts`.
 */
export async function GET(
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
      include: { clienteRelacao: true },
    })

    if (!recibo) {
      return NextResponse.json({ error: 'Recibo não encontrado' }, { status: 404 })
    }

    if (recibo.userId !== session.user.id) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    return NextResponse.json({
      html: buildReciboHtml(recibo),
      numero: recibo.numero,
    })
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    return NextResponse.json({ error: 'Erro ao gerar PDF' }, { status: 500 })
  }
}
