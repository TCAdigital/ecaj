# ECAJ - Sistema de Recibos

Sistema moderno e responsivo para gerenciamento de recibos, desenvolvido com Next.js 14, TypeScript e Tailwind CSS.

## 🚀 Tecnologias

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Banco de Dados**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Autenticação**: NextAuth.js
- **E-mail**: Resend
- **PDF**: jsPDF + html2canvas
- **Deploy**: Vercel

## 📋 Funcionalidades

✅ Login seguro com NextAuth
✅ Cadastro de clientes (nome, CPF/CNPJ, email, telefone, endereço)
✅ Criar recibos com múltiplos serviços
✅ Cálculo automático de totais
✅ Geração de PDF profissional
✅ Assinatura digital (desenho com dedo)
✅ Envio via WhatsApp (link direto)
✅ Envio via E-mail com PDF anexo
✅ Histórico de envios
✅ Duplicar recibos (para mês seguinte)
✅ Arquivamento completo

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta no GitHub
- Conta na Vercel
- Conta no Neon (PostgreSQL)
- API Key do Resend

### Setup Local

1. **Clone o repositório**
```bash
git clone https://github.com/TCAdigital/ecaj.git
cd ecaj
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.local.example .env.local
```

Edite `.env.local` com seus dados:
```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=sua-chave-secreta
NEXTAUTH_URL=http://localhost:3000
RESEND_API_KEY=re_...
```

4. **Setup do banco de dados**
```bash
npx prisma db push
npx prisma generate
```

5. **Execute o servidor**
```bash
npm run dev
```

Acesse: http://localhost:3000

## 🔧 Configuração do Banco de Dados

### Usar Neon PostgreSQL

1. Crie uma conta em https://neon.tech
2. Crie um novo projeto
3. Copie a connection string
4. Cole em `DATABASE_URL` do `.env.local`

## 📧 Configuração do Resend

1. Crie uma conta em https://resend.com
2. Gere uma API key
3. Cole em `RESEND_API_KEY` do `.env.local`

## 🚀 Deploy na Vercel

1. Push o código para GitHub
2. Acesse https://vercel.com/import
3. Selecione o repositório
4. Configure as variáveis de ambiente
5. Deploy!

## 📱 Uso

### Primeiro Acesso
- Email: `ecaj.escritorio@hotmail.com`
- Senha: Definida durante o setup

### Criar Cliente
1. Vá para "Clientes"
2. Preencha os dados
3. Clique em "Cadastrar"

### Criar Recibo
1. Vá para "Novo Recibo"
2. Selecione o cliente
3. Adicione serviços
4. Assine digitalmente (opcional)
5. Clique em "Gerar Recibo"

### Enviar Recibo
- **WhatsApp**: Clique em "WhatsApp" (abre app automaticamente)
- **E-mail**: Clique em "E-mail" (envia com PDF anexo)

## 🗂️ Estrutura do Projeto

```
ecaj/
├── app/
│   ├── api/              # API routes
│   ├── dashboard/        # Páginas do app
│   ├── page.tsx          # Login
│   ├── layout.tsx        # Layout global
│   └── globals.css       # Estilos globais
├── components/           # Componentes React
├── lib/                  # Funções utilitárias
├── prisma/
│   └── schema.prisma     # Schema do banco
├── public/               # Assets estáticos
├── .env.local            # Variáveis de ambiente (local)
├── next.config.js        # Config Next.js
├── tsconfig.json         # Config TypeScript
├── tailwind.config.ts    # Config Tailwind
└── package.json
```

## 🛠️ Desenvolvimento

### Criar nova feature
```bash
git checkout -b feature/sua-feature
# Faça as mudanças
git add .
git commit -m "feat: descrição da feature"
git push origin feature/sua-feature
```

### Gerar tipos Prisma
```bash
npx prisma generate
```

### Abrir Prisma Studio
```bash
npx prisma studio
```

## 📝 Licença

MIT

## 👥 Contato

ECAJ - Assessoria Fiscal e Contábil
- Email: ecaj.escritorio@hotmail.com
- Telefone: (14) 3208-3272
