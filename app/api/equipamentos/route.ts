import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') ?? ''

  const equipamentos = await prisma.equipamento.findMany({
    where: q
      ? { OR: [{ marca: { contains: q } }, { modelo: { contains: q } }, { numeroSerie: { contains: q } }] }
      : undefined,
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { ordens: true } } },
  })

  return NextResponse.json(equipamentos)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const data = await req.json()
  const equipamento = await prisma.equipamento.create({ data })
  return NextResponse.json(equipamento, { status: 201 })
}
