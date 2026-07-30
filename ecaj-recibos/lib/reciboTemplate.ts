import { EMITENTE } from './empresa'
import { escapeHtml, formatBRL, formatDateBR, safeDataImage, toNumber } from './format'

type Item = { descricao?: string; valor?: string | number }

export type ReciboParaTemplate = {
  numero: number
  dataRecebimento: string | null
  valorTotal: number
  assinatura: string | null
  servicos: unknown
  outros: unknown
  clienteRelacao: {
    nome: string
    cpfCnpj: string | null
    endereco: string | null
    cidade: string | null
    estado: string | null
  }
}

function asItems(value: unknown): Item[] {
  return Array.isArray(value) ? (value as Item[]) : []
}

/**
 * Template único do recibo, usado tanto pela rota autenticada quanto pela pública.
 * Renderizado no browser (html2canvas + jsPDF) para virar PDF.
 */
export function buildReciboHtml(recibo: ReciboParaTemplate): string {
  const servicos = asItems(recibo.servicos)
  const outros = asItems(recibo.outros)
  const cliente = recibo.clienteRelacao

  const subtotalServicos = servicos.reduce((acc, s) => acc + toNumber(s.valor), 0)
  const subtotalOutros = outros.reduce((acc, o) => acc + toNumber(o.valor), 0)
  const assinatura = safeDataImage(recibo.assinatura)
  const dataEmissao = formatDateBR(recibo.dataRecebimento)

  const linhaItem = (descricao: unknown, valor: unknown, prefixo = '') => `
    <tr>
      <td>${prefixo}${escapeHtml(descricao)}</td>
      <td class="amt">${formatBRL(valor)}</td>
    </tr>
  `

  const enderecoCliente = cliente.endereco ? `${escapeHtml(cliente.endereco)}<br>` : ''
  const cidadeCliente = cliente.cidade
    ? `${escapeHtml(cliente.cidade)}${cliente.estado ? ' - ' + escapeHtml(cliente.estado) : ''}`
    : ''

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; background: white; }
        .container { width: 210mm; min-height: 297mm; padding: 40px; position: relative; display: flex; flex-direction: column; }

        /* Cabeçalho */
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #1b3661; padding-bottom: 20px; }
        .logo-area { display: flex; align-items: center; gap: 14px; }
        .logo-img { height: 54px; width: auto; max-width: 160px; object-fit: contain; }
        .logo-marca { font-size: 26px; font-weight: bold; color: #1b3661; letter-spacing: -0.5px; line-height: 1; }
        .logo-slogan { font-size: 8.5px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 1.6px; margin-top: 5px; }

        .receipt-title { text-align: right; }
        .receipt-title h2 { font-size: 28px; color: #1b3661; font-weight: 300; letter-spacing: 2px; line-height: 1; margin-bottom: 8px; }
        .receipt-number { font-size: 14px; color: #64748b; font-weight: bold; }

        /* Informações do cliente e da empresa */
        .info-grid { display: flex; justify-content: space-between; margin-bottom: 40px; gap: 30px; }
        .info-box { flex: 1; }
        .info-box-title { font-size: 10px; text-transform: uppercase; color: #94a3b8; font-weight: bold; letter-spacing: 1px; margin-bottom: 8px; }
        .info-content { font-size: 12px; line-height: 1.6; color: #334155; }
        .info-content strong { color: #0f172a; }

        /* Tabela de serviços */
        .table-container { margin-bottom: 30px; }
        .table { width: 100%; border-collapse: collapse; }
        .table th { padding: 12px 15px; text-align: left; background: #f8fafc; color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; font-weight: bold; }
        .table td { padding: 15px; font-size: 13px; color: #334155; border-bottom: 1px solid #f1f5f9; }
        .table td.amt { text-align: right; font-weight: 500; }
        .table th.amt { text-align: right; }
        .table tr:last-child td { border-bottom: none; }
        .item-tag { font-size: 10px; color: #64748b; text-transform: uppercase; }

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
        .sign-role { font-size: 10px; color: #94a3b8; font-weight: normal; }

        /* Rodapé */
        .footer { margin-top: auto; padding-top: 40px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 9px; color: #94a3b8; }
        .declaracao { font-size: 12px; color: #64748b; line-height: 1.5; margin-top: 10px; clear: both; }

        .clearfix::after { content: ""; display: table; clear: both; }
      </style>
    </head>
    <body>
      <div class="container pdf-render-container">
        <div class="header">
          <div class="logo-area">
            <img src="/logo-ecaj.png" alt="Logo ${escapeHtml(EMITENTE.marca)}" class="logo-img" />
            <div class="logo-text">
              <div class="logo-marca">${escapeHtml(EMITENTE.marca)}</div>
              <div class="logo-slogan">${escapeHtml(EMITENTE.slogan)}</div>
            </div>
          </div>
          <div class="receipt-title">
            <h2>RECIBO</h2>
            <div class="receipt-number">Nº ${recibo.numero.toString().padStart(5, '0')}</div>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-box">
            <div class="info-box-title">Emitente</div>
            <div class="info-content">
              <strong>${escapeHtml(EMITENTE.nome)}</strong><br>
              ${escapeHtml(EMITENTE.endereco)}<br>
              ${escapeHtml(EMITENTE.cidadeUf)} - CEP: ${escapeHtml(EMITENTE.cep)}<br>
              Tel: ${escapeHtml(EMITENTE.telefone)}<br>
              ${escapeHtml(EMITENTE.email)}
            </div>
          </div>
          <div class="info-box">
            <div class="info-box-title">Faturado Para</div>
            <div class="info-content">
              <strong>${escapeHtml(cliente.nome)}</strong><br>
              CPF/CNPJ: ${escapeHtml(cliente.cpfCnpj) || 'Não informado'}<br>
              ${enderecoCliente}
              ${cidadeCliente}
            </div>
          </div>
          <div class="info-box" style="flex: 0.5; text-align: right;">
            <div class="info-box-title">Data de Emissão</div>
            <div class="info-content" style="font-size: 14px; font-weight: bold; color: #0f172a;">
              ${dataEmissao || 'Não informada'}
            </div>
          </div>
        </div>

        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th width="75%">Descrição dos Serviços</th>
                <th width="25%" class="amt">Valor (R$)</th>
              </tr>
            </thead>
            <tbody>
              ${servicos.map((s) => linhaItem(s.descricao, s.valor)).join('')}
              ${outros
                .map((o) => linhaItem(o.descricao, o.valor, '<span class="item-tag">Taxa/Outros:</span> '))
                .join('')}
            </tbody>
          </table>
        </div>

        <div class="clearfix">
          <div class="total-box">
            <div class="total-row">
              <span>Subtotal Serviços</span>
              <span>${formatBRL(subtotalServicos)}</span>
            </div>
            <div class="total-row">
              <span>Outros/Taxas</span>
              <span>${formatBRL(subtotalOutros)}</span>
            </div>
            <div class="total-final">
              <span class="label">TOTAL RECEBIDO</span>
              <span class="value">R$ ${formatBRL(recibo.valorTotal)}</span>
            </div>
          </div>
        </div>

        <p class="declaracao">
          Declaramos ter recebido de <strong>${escapeHtml(cliente.nome)}</strong> a importância acima discriminada,
          referente à prestação dos serviços contábeis detalhados, dando-lhe plena e geral quitação.
        </p>

        <div class="signatures">
          <div class="sign-box">
            <div class="sign-line">
              ${assinatura ? `<img src="${assinatura}" class="sign-img">` : ''}
            </div>
            <div class="sign-name">ECAJ ASSESSORIA CONTÁBIL</div>
            <div class="sign-role">Recebedor / Responsável</div>
          </div>
          <div class="sign-box">
            <div class="sign-line"></div>
            <div class="sign-name">${escapeHtml(cliente.nome.toUpperCase())}</div>
            <div class="sign-role">Cliente</div>
          </div>
        </div>

        <div class="footer">
          Documento gerado eletronicamente por ECAJ Sistema de Recibos • Este recibo servirá como comprovante de pagamento após sua efetiva compensação.
        </div>
      </div>
    </body>
    </html>
  `
}
