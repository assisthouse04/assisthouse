import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const role = (session.user as any).role
  if (role !== 'ADMIN') return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const dataInicio = searchParams.get('dataInicio')
  const dataFim = searchParams.get('dataFim')
  const pago = searchParams.get('pago')

  const ordens = await prisma.ordemServico.findMany({
    where: {
      ...(pago !== null && pago !== '' ? { pago: pago === 'true' } : {}),
      ...(dataInicio && dataFim ? {
        dataEntrada: {
          gte: new Date(dataInicio),
          lte: new Date(dataFim + 'T23:59:59'),
        },
      } : {}),
      status: { notIn: ['CANCELADO'] },
      valor: { gt: 0 },
    },
    orderBy: { dataEntrada: 'desc' },
    include: { cliente: { select: { nome: true } } },
  })

  const total = ordens.reduce((s, o) => s + o.valor, 0)
  const totalPago = ordens.filter(o => o.pago).reduce((s, o) => s + o.valor, 0)
  const totalPendente = total - totalPago

  return NextResponse.json({ ordens, total, totalPago, totalPendente })
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const role = (session.user as any).role
  if (role !== 'ADMIN') return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  const { id, pago } = await req.json()
  const ordem = await prisma.ordemServico.update({
    where: { id },
    data: { pago, dataPagamento: pago ? new Date() : null },
  })
  return NextResponse.json(ordem)
}
