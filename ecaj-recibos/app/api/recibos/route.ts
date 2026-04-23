import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const recibos = await prisma.recibos.findMany({
      where: { userId: session.user.id },
      include: { historico: true },
      orderBy: { numero: 'desc' },
    })

    return NextResponse.json(recibos)
  } catch (error) {
    console.error('Erro ao buscar recibos:', error)
    return NextResponse.json({ error: 'Erro ao buscar recibos' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await req.json()
    const { clienteId, dataRecebimento, servicos, outros, valorTotal, assinatura } = body

    if (!clienteId || !servicos) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    // Buscar cliente para pegar o nome
    const cliente = await prisma.clientes.findUnique({
      where: { id: clienteId },
    })

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    const recibo = await prisma.recibos.create({
      data: {
        cliente: cliente.nome,
        clienteId,
        dataRecebimento,
        servicos: servicos,
        outros: outros || [],
        valorTotal,
        assinatura,
        userId: session.user.id,
        historico: {
          create: {
            acao: 'criado',
            descricao: `Recibo criado para ${cliente.nome}`,
          },
        },
      },
      include: { historico: true },
    })

    return NextResponse.json(recibo, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar recibo:', error)
    return NextResponse.json({ error: 'Erro ao criar recibo' }, { status: 500 })
  }
}
