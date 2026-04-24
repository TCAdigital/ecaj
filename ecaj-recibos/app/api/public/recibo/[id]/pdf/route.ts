import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

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

    // Nota: Como o PDF real é gerado no cliente, aqui precisamos 
    // ou retornar os dados para o cliente gerar (complicado na página pública)
    // ou retornar o HTML para um gerador externo (complicado sem Puppeteer).
    // Para simplificar agora e garantir que o link funcione, vamos retornar os dados 
    // que a página pública usará para disparar o download via a mesma lógica do dashboard.
    // Mas a página pública é server-side.
    
    // Melhor: vamos retornar os dados do PDF para que a página pública 
    // possa injetar o HTML em um componente client-side que gera o PDF.
    
    return NextResponse.json({
      html: "HTML_TEMPLATE_HERE", // Preciso extrair o template para um helper reutilizável
      numero: recibo.numero
    })
  } catch (error) {
    console.error('Erro ao buscar dados do recibo público:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
