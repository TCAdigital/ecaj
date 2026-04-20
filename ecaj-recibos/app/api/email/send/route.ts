import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { Resend } from 'resend'
import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)
const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const formData = await req.formData()
    const reciboId = formData.get('reciboId') as string
    const email = formData.get('email') as string
    const nome = formData.get('nome') as string
    const numero = formData.get('numero') as string
    const valor = formData.get('valor') as string
    const pdf = formData.get('pdf') as File

    if (!email || !nome || !numero) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    // Converter PDF para buffer
    const pdfBuffer = await pdf.arrayBuffer()
    const base64Pdf = Buffer.from(pdfBuffer).toString('base64')

    // Enviar email com Resend
    const response = await resend.emails.send({
      from: 'noreply@ecaj.com.br',
      to: email,
      subject: `Recibo #${numero} - ECAJ`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #003366;">Olá ${nome}! 👋</h2>
          
          <p>Seu recibo foi gerado com sucesso!</p>
          
          <div style="background: #f0f7ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Número do Recibo:</strong> #${numero}</p>
            <p style="margin: 5px 0;"><strong>Valor:</strong> R$ ${parseFloat(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          
          <p>O PDF está em anexo. Você pode salvar ou imprimir para seus registros.</p>
          
          <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
          
          <p style="font-size: 12px; color: #666;">
            ECAJ - Assessoria Fiscal e Contábil<br>
            Telefone: (14) 3208-3272<br>
            Email: contato@ecajcontabil.com.br
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `recibo-${numero}.pdf`,
          content: base64Pdf,
        },
      ],
    })

    if (!response.id) {
      return NextResponse.json({ error: 'Erro ao enviar email' }, { status: 500 })
    }

    // Registrar envio no histórico
    await prisma.historico.create({
      data: {
        reciboId,
        acao: 'enviado_email',
        descricao: `E-mail enviado para ${email}`,
        emailEnviadoPara: email,
      },
    })

    return NextResponse.json({
      success: true,
      messageId: response.id,
    })
  } catch (error) {
    console.error('Erro ao enviar email:', error)
    return NextResponse.json({ error: 'Erro ao enviar email' }, { status: 500 })
  }
}
