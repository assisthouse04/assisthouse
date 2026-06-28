import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const ordem = await prisma.ordemServico.findUnique({
    where: { id: params.id },
    include: { cliente: true, equipamento: true, tecnico: { select: { id: true, name: true } } },
  })

  if (!ordem) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  return NextResponse.json(ordem)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const data = await req.json()
  const role = (session.user as any).role

  // Técnico só pode alterar status
  if (role !== 'ADMIN') {
    const allowed = ['RECEBIDO','EM_ANALISE','ORCAMENTO','ORCAMENTO_APROVADO','AGUARDANDO_PECAS','EM_MANUTENCAO','PRONTO']
    if (data.status && !allowed.includes(data.status)) {
      return NextResponse.json({ error: 'Status não permitido' }, { status: 403 })
    }
    const update = data.status ? { status: data.status, diagnostico: data.diagnostico, servicoExecutado: data.servicoExecutado, pecasUtilizadas: data.pecasUtilizadas } : {}
    const ordem = await prisma.ordemServico.update({ where: { id: params.id }, data: update, include: { cliente: true, equipamento: true } })
    return NextResponse.json(ordem)
  }

  const ordem = await prisma.ordemServico.update({
    where: { id: params.id },
    data,
    include: { cliente: true, equipamento: true },
  })
  return NextResponse.json(ordem)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const role = (session.user as any).role
  if (role !== 'ADMIN') return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  await prisma.ordemServico.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
