import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as any

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Buscar recibo original
    const reciboOriginal = await prisma.recibos.findUnique({
      where: { id: params.id },
    })

    if (!reciboOriginal) {
      return NextResponse.json({ error: 'Recibo não encontrado' }, { status: 404 })
    }

    if (reciboOriginal.userId !== session.user.id) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    // Criar novo recibo com os mesmos dados
    const novoRecibo = await prisma.recibos.create({
      data: {
        cliente: reciboOriginal.cliente,
        clienteId: reciboOriginal.clienteId,
        dataRecebimento: reciboOriginal.dataRecebimento,
        servicos: reciboOriginal.servicos || [],
        outros: reciboOriginal.outros || [],
        valorTotal: reciboOriginal.valorTotal,
        assinatura: null, // Resetar assinatura
        userId: session.user.id,
        historico: {
          create: {
            acao: 'duplicado',
            descricao: `Duplicado do recibo #${reciboOriginal.numero}`,
          },
        },
      },
      include: { historico: true },
    })

    return NextResponse.json(novoRecibo, { status: 201 })
  } catch (error) {
    console.error('Erro ao duplicar recibo:', error)
    return NextResponse.json({ error: 'Erro ao duplicar recibo' }, { status: 500 })
  }
}
