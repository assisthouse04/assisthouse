import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const tipo = searchParams.get('tipo') || 'geral'
  const dataInicio = searchParams.get('dataInicio')
  const dataFim = searchParams.get('dataFim')

  const where = dataInicio && dataFim ? {
    dataEntrada: { gte: new Date(dataInicio), lte: new Date(dataFim + 'T23:59:59') },
  } : {}

  const [totalClientes, totalOS, osPorStatus, faturamento, osPorMes] = await Promise.all([
    prisma.cliente.count(),
    prisma.ordemServico.count({ where }),
    prisma.ordemServico.groupBy({ by: ['status'], _count: { _all: true }, where }),
    prisma.ordemServico.aggregate({
      where: { ...where, pago: true },
      _sum: { valor: true },
      _count: { _all: true },
    }),
    // OS por mês (últimos 6 meses)
    prisma.$queryRaw`
      SELECT strftime('%Y-%m', dataEntrada) as mes, COUNT(*) as total, SUM(valor) as faturamento
      FROM OrdemServico
      GROUP BY mes
      ORDER BY mes DESC
      LIMIT 6
    `,
  ])

  return NextResponse.json({
    totalClientes,
    totalOS,
    osPorStatus,
    faturamento: {
      total: faturamento._sum.valor ?? 0,
      qtd: faturamento._count._all,
    },
    osPorMes,
  })
}
