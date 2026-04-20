import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const prisma = new PrismaClient()

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

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

    const servicos = JSON.parse(recibo.servicos)
    const outros = JSON.parse(recibo.outros || '[]')

    // Criar HTML do recibo
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; color: #333; }
          .container { width: 210mm; height: 297mm; padding: 20px; background: white; }
          .header { margin-bottom: 30px; border-bottom: 2px solid #003366; padding-bottom: 20px; }
          .header h1 { color: #003366; font-size: 24px; }
          .header-right { float: right; text-align: center; border: 2px solid #003366; padding: 15px; }
          .header-right .numero { font-size: 32px; font-weight: bold; color: #cc0000; }
          .company-info { font-size: 11px; color: #003366; margin-bottom: 10px; line-height: 1.5; clear: both; }
          .info-row { margin-bottom: 15px; }
          .info-label { font-weight: bold; margin-bottom: 5px; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .table th { background: #d9e8f5; color: #003366; padding: 10px; text-align: left; border: 1px solid #003366; font-weight: bold; }
          .table td { padding: 10px; border: 1px solid #003366; }
          .table tr:nth-child(even) { background: #f9f9f9; }
          .total-row { background: #c0c0c0; font-weight: bold; }
          .signature { margin-top: 40px; }
          .signature-img { max-width: 200px; height: auto; }
          .footer { margin-top: 20px; font-size: 10px; text-align: right; color: #666; }
          .clearfix::after { content: ""; display: table; clear: both; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header clearfix">
            <div>
              <h1>ECAJ - Assessoria Fiscal e Contábil</h1>
              <p style="font-size: 11px; color: #003366; margin-top: 5px;">
                Abertura • Transferência • Encerramento • Escrita Fiscal e Contábil
              </p>
            </div>
            <div class="header-right">
              <div style="font-size: 12px; margin-bottom: 5px;">REQUISIÇÃO<br>E RECIBO</div>
              <div class="numero">${recibo.numero}</div>
            </div>
          </div>

          <div class="company-info">
            <strong>Rua Olavo Bilac, 4-26, Vila São João da Boa Vista, CEP: 17060-454, Bauru/SP</strong><br>
            (14) 3208-3272 | Email: noreply@ecaj.com.br
          </div>

          <div class="info-row">
            <div class="info-label">Bauru, ${new Date(recibo.dataRecebimento).toLocaleDateString('pt-BR')}</div>
          </div>

          <div class="info-row">
            <div class="info-label">Cliente:</div>
            <div>${recibo.clienteRelacao.nome}</div>
          </div>

          <div class="info-row">
            <div class="info-label">CPF/CNPJ:</div>
            <div>${recibo.clienteRelacao.cpfCnpj || '-'}</div>
          </div>

          <p style="font-size: 12px; margin: 20px 0; color: #666;">
            Solicitamos a gentileza de entregar as importâncias abaixo descritas para pagamento de:
          </p>

          <table class="table">
            <thead>
              <tr>
                <th width="70%">Serviços</th>
                <th width="30%">Valor</th>
              </tr>
            </thead>
            <tbody>
              ${servicos.map((s: any) => `
                <tr>
                  <td>${s.descricao}</td>
                  <td>R$ ${parseFloat(s.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          ${outros.length > 0 ? `
            <table class="table">
              <thead>
                <tr>
                  <th width="70%">Outros</th>
                  <th width="30%">Valor</th>
                </tr>
              </thead>
              <tbody>
                ${outros.map((o: any) => `
                  <tr>
                    <td>${o.descricao}</td>
                    <td>R$ ${parseFloat(o.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}

          <table class="table">
            <tbody>
              <tr class="total-row">
                <td width="70%">TOTAL</td>
                <td width="30%">R$ ${recibo.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>

          ${recibo.assinatura ? `
            <div class="signature">
              <p style="font-size: 12px; margin-bottom: 10px;"><strong>Assinatura:</strong></p>
              <img src="${recibo.assinatura}" class="signature-img" alt="Assinatura">
            </div>
          ` : ''}

          <div style="margin-top: 60px; border-top: 1px solid #ccc; padding-top: 20px; display: flex; justify-content: space-between;">
            <div style="text-align: center; width: 45%;">
              <p style="border-top: 1px solid #000; padding-top: 10px; font-size: 11px;">Ass. responsável pela cobrança</p>
            </div>
            <div style="width: 10%;"></div>
            <div style="text-align: center; width: 45%;">
              <p style="border-top: 1px solid #000; padding-top: 10px; font-size: 11px;">Ass. Cobrador</p>
            </div>
          </div>

          <div class="footer">
            <p>C ograf (14) 3222-7281</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Gerar PDF (lado do servidor é limitado, melhor fazer no cliente)
    // Por enquanto, vamos retornar HTML que será processado no cliente
    return NextResponse.json({
      html: htmlContent,
      numero: recibo.numero,
    })
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    return NextResponse.json({ error: 'Erro ao gerar PDF' }, { status: 500 })
  }
}
