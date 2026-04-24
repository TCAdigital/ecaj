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

    const servicos = (recibo.servicos as any) || []
    const outros = (recibo.outros as any) || []

    // Criar HTML do recibo (Design Moderno & Profissional)
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; background: white; }
          .container { width: 210mm; min-height: 297mm; padding: 40px; position: relative; display: flex; flex-direction: column; }
          
          /* Cabeçalho Profissional */
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #0f766e; padding-bottom: 20px; }
          .logo-area { display: flex; align-items: center; gap: 15px; }
          .logo-placeholder { width: 45px; height: 45px; background: #0f766e; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; border-radius: 8px; font-size: 24px; }
          .company-name { font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
          .company-slogan { font-size: 11px; color: #64748b; letter-spacing: 0.5px; text-transform: uppercase; margin-top: 4px; }
          
          .receipt-title { text-align: right; }
          .receipt-title h2 { font-size: 28px; color: #0f766e; font-weight: 300; letter-spacing: 2px; line-height: 1; margin-bottom: 8px; }
          .receipt-number { font-size: 14px; color: #64748b; font-weight: bold; }
          
          /* Informações do Cliente e Empresa */
          .info-grid { display: flex; justify-content: space-between; margin-bottom: 40px; gap: 30px; }
          .info-box { flex: 1; }
          .info-box-title { font-size: 10px; text-transform: uppercase; color: #94a3b8; font-weight: bold; letter-spacing: 1px; margin-bottom: 8px; }
          .info-content { font-size: 12px; line-height: 1.6; color: #334155; }
          .info-content strong { color: #0f172a; }
          
          /* Tabela de Serviços */
          .table-container { margin-bottom: 30px; }
          .table { width: 100%; border-collapse: collapse; }
          .table th { padding: 12px 15px; text-align: left; background: #f8fafc; color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; font-weight: bold; }
          .table td { padding: 15px; font-size: 13px; color: #334155; border-bottom: 1px solid #f1f5f9; }
          .table td.amt { text-align: right; font-weight: 500; }
          .table th.amt { text-align: right; }
          .table tr:last-child td { border-bottom: none; }
          
          /* Totalizador */
          .total-box { float: right; width: 300px; background: #f8fafc; border-radius: 8px; padding: 20px; text-align: right; border: 1px solid #e2e8f0; margin-bottom: 40px; }
          .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; color: #64748b; }
          .total-final { display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding-top: 15px; border-top: 2px solid #e2e8f0; }
          .total-final .label { font-size: 14px; font-weight: bold; color: #0f172a; }
          .total-final .value { font-size: 24px; font-weight: bold; color: #0f766e; }
          
          /* Assinaturas */
          .signatures { clear: both; display: flex; justify-content: space-between; margin-top: 80px; padding-top: 40px; }
          .sign-box { flex: 1; text-align: center; padding: 0 40px; }
          .sign-line { border-bottom: 1px solid #94a3b8; margin-bottom: 10px; height: 60px; position: relative; }
          .sign-img { max-height: 50px; position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%); }
          .sign-name { font-size: 11px; color: #475569; font-weight: bold; }
          
          /* Rodapé */
          .footer { margin-top: auto; padding-top: 40px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 9px; color: #94a3b8; }
          
          .clearfix::after { content: ""; display: table; clear: both; }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <div class="logo-area">
              <div class="logo-placeholder">E</div>
              <div>
                <div class="company-name">ECAJ</div>
                <div class="company-slogan">Assessoria Fiscal e Contábil</div>
              </div>
            </div>
            <div class="receipt-title">
              <h2>RECIBO</h2>
              <div class="receipt-number">Nº ${recibo.numero.toString().padStart(5, '0')}</div>
            </div>
          </div>

          <!-- Info Blocos -->
          <div class="info-grid">
            <div class="info-box">
              <div class="info-box-title">Emitente</div>
              <div class="info-content">
                <strong>ECAJ Assessoria Contábil</strong><br>
                Rua Olavo Bilac, 4-26, Vila São João da Boa Vista<br>
                Bauru/SP - CEP: 17060-454<br>
                Tel: (14) 3208-3272<br>
                contato@ecajcontabil.com.br
              </div>
            </div>
            <div class="info-box">
              <div class="info-box-title">Faturado Para</div>
              <div class="info-content">
                <strong>${recibo.clienteRelacao.nome}</strong><br>
                CPF/CNPJ: ${recibo.clienteRelacao.cpfCnpj || 'Não informado'}<br>
                ${recibo.clienteRelacao.endereco ? recibo.clienteRelacao.endereco + '<br>' : ''}
                ${recibo.clienteRelacao.cidade ? recibo.clienteRelacao.cidade + ' - ' + (recibo.clienteRelacao.estado || '') : ''}
              </div>
            </div>
            <div class="info-box" style="flex: 0.5; text-align: right;">
              <div class="info-box-title">Data de Emissão</div>
              <div class="info-content" style="font-size: 14px; font-weight: bold; color: #0f172a;">
                ${recibo.dataRecebimento ? new Date(recibo.dataRecebimento).toLocaleDateString('pt-BR') : 'Não informada'}
              </div>
            </div>
          </div>

          <!-- Serviços -->
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th width="75%">Descrição dos Serviços</th>
                  <th width="25%" class="amt">Valor (R$)</th>
                </tr>
              </thead>
              <tbody>
                ${servicos.map((s: any) => `
                  <tr>
                    <td>${s.descricao}</td>
                    <td class="amt">${parseFloat(s.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                `).join('')}
                ${outros.map((o: any) => `
                  <tr>
                    <td><span style="font-size: 10px; color: #64748b; text-transform: uppercase;">Taxa/Outros:</span> ${o.descricao}</td>
                    <td class="amt">${parseFloat(o.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Totalizador -->
          <div class="clearfix">
            <div class="total-box">
              <div class="total-row">
                <span>Subtotal Serviços</span>
                <span>${servicos.reduce((acc: number, s: any) => acc + parseFloat(s.valor), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div class="total-row">
                <span>Outros/Taxas</span>
                <span>${outros.reduce((acc: number, o: any) => acc + parseFloat(o.valor), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div class="total-final">
                <span class="label">TOTAL RECEBIDO</span>
                <span class="value">R$ ${recibo.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-top: 10px; clear: both;">
            Declaramos ter recebido de <strong>${recibo.clienteRelacao.nome}</strong> a importância acima discriminada, referente à prestação dos serviços contábeis detalhados, dando-lhe plena e geral quitação.
          </p>

          <!-- Assinaturas -->
          <div class="signatures">
            <div class="sign-box">
              <div class="sign-line">
                ${recibo.assinatura ? `<img src="${recibo.assinatura}" class="sign-img">` : ''}
              </div>
              <div class="sign-name">ECAJ ASSESSORIA CONTÁBIL</div>
              <div style="font-size: 10px; color: #94a3b8; font-weight: normal;">Recebedor / Responsável</div>
            </div>
            <div class="sign-box">
              <div class="sign-line"></div>
              <div class="sign-name">${recibo.clienteRelacao.nome.toUpperCase()}</div>
              <div style="font-size: 10px; color: #94a3b8; font-weight: normal;">Cliente</div>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            Documento gerado eletronicamente por ECAJ Sistema de Recibos • Este recibo servirá como comprovante de pagamento após sua efetiva compensação.
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
