import fs from 'fs'
import path from 'path'

async function main() {
  const logoPath = path.join(process.cwd(), 'public', 'logo.jpg')
  let logoBase64 = ''
  if (fs.existsSync(logoPath)) {
    const logoBuffer = fs.readFileSync(logoPath)
    logoBase64 = `data:image/jpeg;base64,${logoBuffer.toString('base64')}`
  }

  const recibo = {
    numero: 42,
    dataRecebimento: '2026-07-23',
    valorTotal: 1500.00,
    clienteRelacao: {
      nome: 'Empresa Exemplo de Teste Ltda',
      cpfCnpj: '12.345.678/0001-99',
      endereco: 'Av. Paulista, 1000 - Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    assinatura: null
  }

  const servicos = [
    { descricao: 'Assessoria Fiscal Mensal - Referente a Julho/2026', valor: '1200.00' },
    { descricao: 'Declaração Anual do Simples Nacional (DASN-SIMEI)', valor: '300.00' }
  ]
  const outros: any[] = []

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Recibo de Teste - ECAJ</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; background: #f8fafc; padding: 40px 0; }
        .container { width: 210mm; min-height: 297mm; padding: 40px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); position: relative; display: flex; flex-direction: column; }
        
        /* Cabeçalho Profissional */
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #1b3661; padding-bottom: 20px; }
        .logo-area { display: flex; align-items: center; gap: 15px; }
        .logo-img { height: 65px; width: auto; max-width: 250px; object-fit: contain; }
        
        .receipt-title { text-align: right; }
        .receipt-title h2 { font-size: 28px; color: #1b3661; font-weight: 300; letter-spacing: 2px; line-height: 1; margin-bottom: 8px; }
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
        .total-final .value { font-size: 24px; font-weight: bold; color: #1b3661; }
        
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
            <img src="${logoBase64}" alt="Logo ECAJ" class="logo-img" />
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
              Tel: (14) 99795-7652<br>
              nfsecaj.escritorio@hotmail.com
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
              ${new Date(recibo.dataRecebimento).toLocaleDateString('pt-BR')}
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
              <!-- Assinatura mockada -->
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

  const outputPath = path.join(process.cwd(), 'recibo-exemplo.html')
  fs.writeFileSync(outputPath, htmlContent)
  console.log(`✅ Recibo exemplo gerado com sucesso em: ${outputPath}`)
}

main()
