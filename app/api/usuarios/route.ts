import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const role = (session.user as any).role
  if (role !== 'ADMIN') return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  const users = await prisma.user.findMany({
    select: { id:true, name:true, email:true, role:true, active:true, createdAt:true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const role = (session.user as any).role
  if (role !== 'ADMIN') return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  const { name, email, password, userRole } = await req.json()

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 409 })

  const hash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { name, email, password: hash, role: userRole || 'TECNICO' },
    select: { id:true, name:true, email:true, role:true, active:true, createdAt:true },
  })
  return NextResponse.json(user, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const role = (session.user as any).role
  if (role !== 'ADMIN') return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  const { id, name, email, userRole, active, password } = await req.json()
  const data: any = { name, email, role: userRole, active }
  if (password) data.password = await bcrypt.hash(password, 12)

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id:true, name:true, email:true, role:true, active:true },
  })
  return NextResponse.json(user)
}
