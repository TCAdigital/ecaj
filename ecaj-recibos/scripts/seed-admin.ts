import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@ecaj.com.br'
  const password = process.env.ADMIN_PASSWORD || 'Ecaj@2026'
  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
    },
    create: {
      email,
      password: hashedPassword,
      nome: 'Administrador',
      role: 'admin',
      ativo: true,
    },
  })

  console.log('✅ Usuário administrador criado/atualizado com sucesso!')
  console.log(`📧 Email: ${email}`)
  console.log(`🔑 Senha: ${password}`)
}

main()
  .catch((e) => {
    console.error('❌ Erro ao criar administrador:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
