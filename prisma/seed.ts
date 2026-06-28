import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('admin123', 12)

  await prisma.user.upsert({
    where: { email: 'admin@assisthouse.com' },
    update: {},
    create: {
      name: 'Josinaldo Mariano',
      email: 'admin@assisthouse.com',
      password: hash,
      role: 'ADMIN',
    },
  })

  await prisma.configuracao.upsert({
    where: { chave: 'empresa_nome' },
    update: {},
    create: { chave: 'empresa_nome', valor: 'ASSISTHOUSE INFORMÁTICA', updatedAt: new Date() },
  })
  await prisma.configuracao.upsert({
    where: { chave: 'empresa_endereco' },
    update: {},
    create: { chave: 'empresa_endereco', valor: 'Av. Bahia, 630, Sala 5, Bairro dos Estados, João Pessoa/PB', updatedAt: new Date() },
  })
  await prisma.configuracao.upsert({
    where: { chave: 'empresa_telefone' },
    update: {},
    create: { chave: 'empresa_telefone', valor: '(83) 98821-4778', updatedAt: new Date() },
  })

  console.log('✅ Seed concluído!')
  console.log('Login: admin@assisthouse.com | Senha: admin123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
