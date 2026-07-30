import fs from 'fs'
import path from 'path'
import { buildReciboHtml } from '../lib/reciboTemplate'

/**
 * Gera um recibo de exemplo em HTML para conferir o layout sem tocar no banco.
 * Usa exatamente o mesmo template das rotas de PDF.
 *
 *   npx tsx scripts/generate-mock-receipt.ts
 */
async function main() {
  const html = buildReciboHtml({
    numero: 42,
    dataRecebimento: '2026-07-23',
    valorTotal: 1500.0,
    assinatura: null,
    servicos: [
      { descricao: 'Assessoria Fiscal Mensal - Referente a Julho/2026', valor: '1200.00' },
      { descricao: 'Declaração Anual do Simples Nacional (DASN-SIMEI)', valor: '300.00' },
    ],
    outros: [],
    clienteRelacao: {
      nome: 'Empresa Exemplo de Teste Ltda',
      cpfCnpj: '12.345.678/0001-99',
      endereco: 'Av. Paulista, 1000 - Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
    },
  })

  // O template referencia /logo.jpg (servido pelo Next). Fora do app, embute a
  // imagem para o arquivo abrir corretamente no browser.
  const logoPath = path.join(process.cwd(), 'public', 'logo.jpg')
  const htmlComLogo = fs.existsSync(logoPath)
    ? html.replace(
        'src="/logo.jpg"',
        `src="data:image/jpeg;base64,${fs.readFileSync(logoPath).toString('base64')}"`
      )
    : html

  const outputPath = path.join(process.cwd(), 'recibo-exemplo.html')
  fs.writeFileSync(outputPath, htmlComLogo)
  console.log(`✅ Recibo exemplo gerado com sucesso em: ${outputPath}`)
}

main()
