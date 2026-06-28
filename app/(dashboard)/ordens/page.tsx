'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Link from 'next/link'
import { Plus, Search, Filter } from 'lucide-react'
import { formatDateTime, formatCurrency, STATUS_LABELS, STATUS_COLORS } from '@/lib/utils'
import { cn } from '@/lib/utils'

const STATUSES = ['','RECEBIDO','EM_ANALISE','ORCAMENTO','ORCAMENTO_APROVADO','AGUARDANDO_PECAS','EM_MANUTENCAO','PRONTO','FINALIZADO','ENTREGUE','CANCELADO']

interface OS {
  id:string; numero:string; status:string; valor:number; dataEntrada:string
  cliente:{nome:string}; equipamento:{marca:string;modelo:string;tipo:string}
}

export default function OrdensPage() {
  const [lista, setLista] = useState<OS[]>([])
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (status) params.set('status', status)
    const res = await fetch(`/api/ordens?${params}`)
    setLista(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [q, status])

  return (
    <div className="flex flex-col flex-1">
      <Header title="Ordens de Serviço" subtitle="Gerenciamento de OS" />
      <main className="flex-1 p-6">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={q} onChange={e=>setQ(e.target.value)}
              placeholder="Número da OS, cliente ou CPF..."
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select value={status} onChange={e=>setStatus(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todos os status</option>
              {STATUSES.filter(Boolean).map(s=><option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>
          <Link href="/ordens/nova"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors ml-auto">
            <Plus className="w-4 h-4" /> Nova OS
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 font-medium">Número</th>
                <th className="text-left px-5 py-3 font-medium">Cliente</th>
                <th className="text-left px-5 py-3 font-medium">Equipamento</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Valor</th>
                <th className="text-left px-5 py-3 font-medium">Data Entrada</th>
                <th className="text-left px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="text-center py-8 text-slate-400">Carregando...</td></tr>}
              {!loading && lista.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-slate-400">Nenhuma OS encontrada</td></tr>}
              {lista.map(os => (
                <tr key={os.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 text-sm font-mono font-semibold text-blue-700">{os.numero}</td>
                  <td className="px-5 py-3 text-sm text-slate-800">{os.cliente.nome}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{os.equipamento.marca} {os.equipamento.modelo}</td>
                  <td className="px-5 py-3">
                    <span className={cn('px-2 py-1 rounded-full text-xs font-medium', STATUS_COLORS[os.status])}>
                      {STATUS_LABELS[os.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm font-medium">{formatCurrency(os.valor)}</td>
                  <td className="px-5 py-3 text-sm text-slate-500">{formatDateTime(os.dataEntrada)}</td>
                  <td className="px-5 py-3">
                    <Link href={`/ordens/${os.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Abrir →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
