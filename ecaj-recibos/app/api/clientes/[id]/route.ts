import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as any

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const cliente = await prisma.clientes.findUnique({
      where: { id: params.id },
    })

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    if (cliente.userId !== session.user.id) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    return NextResponse.json(cliente)
  } catch (error) {
    console.error('Erro ao buscar cliente:', error)
    return NextResponse.json({ error: 'Erro ao buscar cliente' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as any

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const cliente = await prisma.clientes.findUnique({
      where: { id: params.id },
    })

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    if (cliente.userId !== session.user.id) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const body = await req.json()
    const { nome, cpfCnpj, email, telefone, endereco, cidade, estado, cep } = body

    const atualizado = await prisma.clientes.update({
      where: { id: params.id },
      data: {
        nome: nome || cliente.nome,
        cpfCnpj,
        email: email || '',
        telefone,
        endereco,
        cidade,
        estado,
        cep,
      },
    })

    // O nome do cliente é copiado para o recibo na emissão; mantém os
    // recibos existentes coerentes com o cadastro após uma renomeação.
    if (atualizado.nome !== cliente.nome) {
      await prisma.recibos.updateMany({
        where: { clienteId: params.id },
        data: { cliente: atualizado.nome },
      })
    }

    return NextResponse.json(atualizado)
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error)
    return NextResponse.json({ error: 'Erro ao atualizar cliente' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as any

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const cliente = await prisma.clientes.findUnique({
      where: { id: params.id },
    })

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    if (cliente.userId !== session.user.id) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    // A relação é ON DELETE CASCADE: apagar o cliente apagaria junto todos os
    // recibos já emitidos para ele. Recibos são documentos fiscais, então a
    // exclusão é bloqueada em vez de destruir o histórico silenciosamente.
    const totalRecibos = await prisma.recibos.count({
      where: { clienteId: params.id },
    })

    if (totalRecibos > 0) {
      return NextResponse.json(
        {
          error:
            `Este cliente possui ${totalRecibos} recibo(s) emitido(s) e não pode ser excluído. ` +
            `Exclua os recibos primeiro, caso realmente queira remover o histórico.`,
        },
        { status: 409 }
      )
    }

    await prisma.clientes.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar cliente:', error)
    return NextResponse.json({ error: 'Erro ao deletar cliente' }, { status: 500 })
  }
}
