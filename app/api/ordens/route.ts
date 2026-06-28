import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateOSNumber } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') ?? ''
  const status = searchParams.get('status') ?? ''
  const dataInicio = searchParams.get('dataInicio')
  const dataFim = searchParams.get('dataFim')

  const ordens = await prisma.ordemServico.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q ? {
        OR: [
          { numero: { contains: q } },
          { cliente: { nome: { contains: q } } },
          { cliente: { cpf: { contains: q } } },
        ],
      } : {}),
      ...(dataInicio && dataFim ? {
        dataEntrada: {
          gte: new Date(dataInicio),
          lte: new Date(dataFim + 'T23:59:59'),
        },
      } : {}),
    },
    orderBy: { dataEntrada: 'desc' },
    include: {
      cliente: true,
      equipamento: true,
      tecnico: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(ordens)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const data = await req.json()
  const userId = (session.user as any).id

  // Gerar número único
  let numero = generateOSNumber()
  while (await prisma.ordemServico.findUnique({ where: { numero } })) {
    numero = generateOSNumber()
  }

  const ordem = await prisma.ordemServico.create({
    data: {
      ...data,
      numero,
      tecnicoId: userId,
    },
    include: { cliente: true, equipamento: true },
  })

  return NextResponse.json(ordem, { status: 201 })
}
