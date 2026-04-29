import { authOptions } from '@/lib/auth'
import nodemailer from 'nodemailer'
import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any

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

    if (!email || !nome || !numero || !pdf) {
      return NextResponse.json({ error: 'Dados incompletos (e-mail, nome, número ou PDF ausente)' }, { status: 400 })
    }

    // Converter PDF para buffer
    const pdfBuffer = await pdf.arrayBuffer()
    const buffer = Buffer.from(pdfBuffer)

    // Configurar transportador SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mail.ecajcontabil.com.br',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', // true apenas para 465
      auth: {
        user: process.env.SMTP_USER || 'contato@ecajcontabil.com.br',
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 8000, // 8 segundos (para não estourar os 10s da Vercel)
      greetingTimeout: 8000,
      socketTimeout: 8000,
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
      }
    })

    // Enviar email com Nodemailer
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'contato@ecajcontabil.com.br',
      to: email,
      subject: `Recibo #${numero} - ECAJ`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 40px 20px;">
          <div style="background-color: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #0f766e; padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 1px;">ECAJ</h1>
              <p style="color: #99f6e4; margin: 5px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Assessoria Contábil</p>
            </div>
            
            <div style="padding: 40px 30px;">
              <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px;">Olá, ${nome}!</h2>
              <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Seu recibo foi gerado com sucesso pelo nosso sistema. Abaixo você encontra os detalhes do documento que também segue em anexo como PDF.
              </p>
              
              <div style="background-color: #f1f5f9; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding-bottom: 10px; color: #64748b; font-size: 13px; text-transform: uppercase; font-weight: bold;">Número do Recibo</td>
                    <td style="padding-bottom: 10px; text-align: right; color: #1e293b; font-weight: bold;">#${numero}</td>
                  </tr>
                  <tr>
                    <td style="padding-top: 10px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 13px; text-transform: uppercase; font-weight: bold;">Valor Recebido</td>
                    <td style="padding-top: 10px; border-top: 1px solid #e2e8f0; text-align: right; color: #0176ed; font-size: 18px; font-weight: 800;">R$ ${parseFloat(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </table>
              </div>
              
              <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0; text-align: center;">
                Este é um e-mail automático. Por favor, não responda. <br>
                Em caso de dúvidas, entre em contato conosco pelos canais oficiais.
              </p>
            </div>
            
            <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 30px; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                <strong>ECAJ - Assessoria Fiscal e Contábil</strong><br>
                Rua Olavo Bilac, 4-26, Vila São João da Boa Vista, Bauru/SP<br>
                (14) 3208-3272 • ecaj.escritorio@hotmail.com
              </p>
            </div>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `recibo-${numero}.pdf`,
          content: buffer,
        },
      ],
    })

    if (!info.messageId) {
      return NextResponse.json({ 
        error: 'Erro ao enviar email', 
        details: 'O servidor SMTP não retornou um ID de mensagem. Verifique as configurações.' 
      }, { status: 500 })
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
      messageId: info.messageId,
    })
  } catch (error: any) {
    console.error('Erro ao enviar email:', error)
    return NextResponse.json({ 
      error: 'Erro ao enviar email', 
      details: error.message || String(error)
    }, { status: 500 })
  }
}
