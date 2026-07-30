/** Dados do emitente. Ponto único de alteração para recibos, e-mails e páginas. */
export const EMITENTE = {
  nome: 'ECAJ Assessoria Contábil',
  nomeCompleto: 'ECAJ - Assessoria Fiscal e Contábil',
  endereco: 'Rua Olavo Bilac, 4-26, Vila São João da Boa Vista',
  cidadeUf: 'Bauru/SP',
  cep: '17060-454',
  telefone: '(14) 99795-7652',
  email: 'nfsecaj.escritorio@hotmail.com',
} as const

/** E-mail que recebe a cópia automática de todo recibo emitido. */
export const EMAIL_ESCRITORIO = EMITENTE.email
