import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') ?? ''

  const clientes = await prisma.cliente.findMany({
    where: q
      ? {
          OR: [
            { nome: { contains: q } },
            { cpf: { contains: q } },
            { telefone: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { nome: 'asc' },
    include: { _count: { select: { ordens: true } } },
  })

  return NextResponse.json(clientes)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const data = await req.json()

  // Verificar CPF duplicado
  const existing = await prisma.cliente.findUnique({ where: { cpf: data.cpf } })
  if (existing) return NextResponse.json({ error: 'CPF já cadastrado', cliente: existing }, { status: 409 })

  const cliente = await prisma.cliente.create({ data })
  return NextResponse.json(cliente, { status: 201 })
}
