import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Header from '@/components/layout/Header'
import Link from 'next/link'
import { Clock, CheckCircle, DollarSign, AlertCircle, Plus, ArrowRight } from 'lucide-react'
import { formatCurrency, formatDateTime, STATUS_LABELS, STATUS_COLORS } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default async function DashboardPage() {
  const [osAndamento, osProntas, financeiro, pendentes, recentes] = await Promise.all([
    prisma.ordemServico.count({ where: { status: { in: ['RECEBIDO','EM_ANALISE','ORCAMENTO','ORCAMENTO_APROVADO','AGUARDANDO_PECAS','EM_MANUTENCAO'] } } }),
    prisma.ordemServico.count({ where: { status: 'PRONTO' } }),
    prisma.ordemServico.aggregate({ where: { status: 'FINALIZADO', pago: true }, _sum: { valor: true } }),
    prisma.ordemServico.count({ where: { status: { in: ['RECEBIDO', 'EM_ANALISE'] } } }),
    prisma.ordemServico.findMany({
      take: 8,
      orderBy: { dataEntrada: 'desc' },
      include: { cliente: true, equipamento: true },
    }),
  ])

  const kpis = [
    { label: 'OS em Andamento', value: osAndamento, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', sub: 'Serviços em processo' },
    { label: 'OS Prontas', value: osProntas, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', sub: 'Aguardando entrega' },
    { label: 'Faturamento', value: formatCurrency(financeiro._sum.valor ?? 0), icon: DollarSign, color: 'text-yellow-600', bg: 'bg-yellow-50', sub: 'Serviços pagos' },
    { label: 'Pendentes', value: pendentes, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', sub: 'Aguardando análise' },
  ]

  return (
    <div className="flex flex-col flex-1">
      <Header title="Dashboard" subtitle="Visão geral do sistema de gestão" />
      <main className="flex-1 p-6 space-y-6">

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map(({ label, value, icon: Icon, color, bg, sub }) => (
            <div key={label} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm text-slate-500">{label}</p>
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', bg)}>
                  <Icon className={cn('w-5 h-5', color)} />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-800">{value}</p>
              <p className="text-xs text-slate-400 mt-1">{sub}</p>
            </div>
          ))}
        </div>

        {/* OS Recentes */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">Ordens de Serviço Recentes</h2>
            <div className="flex items-center gap-3">
              <Link href="/ordens/nova" className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" /> Nova OS
              </Link>
              <Link href="/ordens" className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                Ver todas <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-slate-100">
                  <th className="text-left px-6 py-3 font-medium">Número</th>
                  <th className="text-left px-6 py-3 font-medium">Cliente</th>
                  <th className="text-left px-6 py-3 font-medium">Equipamento</th>
                  <th className="text-left px-6 py-3 font-medium">Status</th>
                  <th className="text-left px-6 py-3 font-medium">Valor</th>
                  <th className="text-left px-6 py-3 font-medium">Data</th>
                  <th className="text-left px-6 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {recentes.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-8 text-slate-400">Nenhuma OS cadastrada</td></tr>
                )}
                {recentes.map(os => (
                  <tr key={os.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 text-sm font-mono font-medium text-blue-700">{os.numero}</td>
                    <td className="px-6 py-3 text-sm text-slate-800">{os.cliente.nome}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{os.equipamento.marca} {os.equipamento.modelo}</td>
                    <td className="px-6 py-3">
                      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', STATUS_COLORS[os.status])}>
                        {STATUS_LABELS[os.status]}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-slate-800">{formatCurrency(os.valor)}</td>
                    <td className="px-6 py-3 text-sm text-slate-500">{formatDateTime(os.dataEntrada)}</td>
                    <td className="px-6 py-3">
                      <Link href={`/ordens/${os.id}`} className="text-blue-600 hover:text-blue-800 text-sm">
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  )
}
