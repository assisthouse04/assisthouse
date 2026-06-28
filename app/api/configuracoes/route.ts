import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const configs = await prisma.configuracao.findMany()
  return NextResponse.json(configs)
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const role = (session.user as any).role
  if (role !== 'ADMIN') return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  const data: Record<string, string> = await req.json()

  await Promise.all(
    Object.entries(data).map(([chave, valor]) =>
      prisma.configuracao.upsert({
        where: { chave },
        update: { valor, updatedAt: new Date() },
        create: { chave, valor, updatedAt: new Date() },
      })
    )
  )

  return NextResponse.json({ ok: true })
}
