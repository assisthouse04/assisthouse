import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const cliente = await prisma.cliente.findUnique({
    where: { id: params.id },
    include: {
      ordens: {
        orderBy: { dataEntrada: 'desc' },
        include: { equipamento: true },
      },
    },
  })

  if (!cliente) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  return NextResponse.json(cliente)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const role = (session.user as any).role
  if (role !== 'ADMIN') return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  const data = await req.json()
  const cliente = await prisma.cliente.update({ where: { id: params.id }, data })
  return NextResponse.json(cliente)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const role = (session.user as any).role
  if (role !== 'ADMIN') return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  await prisma.cliente.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
