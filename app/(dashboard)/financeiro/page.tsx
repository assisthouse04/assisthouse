'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Link from 'next/link'
import { DollarSign, TrendingUp, Clock, CheckCircle, Filter } from 'lucide-react'
import { formatCurrency, formatDate, STATUS_LABELS } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface OS { id:string;numero:string;status:string;valor:number;pago:boolean;formaPagamento?:string;dataEntrada:string;dataPagamento?:string; cliente:{nome:string} }
interface Data { ordens:OS[]; total:number; totalPago:number; totalPendente:number }

export default function FinanceiroPage() {
  const [data, setData] = useState<Data|null>(null)
  const [loading, setLoading] = useState(true)
  const [pago, setPago] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  async function load() {
    setLoading(true)
    const p = new URLSearchParams()
    if (pago !== '') p.set('pago', pago)
    if (dataInicio) p.set('dataInicio', dataInicio)
    if (dataFim) p.set('dataFim', dataFim)
    const res = await fetch(`/api/financeiro?${p}`)
    setData(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [pago, dataInicio, dataFim])

  async function togglePago(id: string, pago: boolean) {
    await fetch('/api/financeiro', {
      method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id,pago:!pago}),
    })
    load()
  }

  return (
    <div className="flex flex-col flex-1">
      <Header title="Financeiro" subtitle="Controle de receitas e pagamentos" />
      <main className="flex-1 p-6 space-y-6">

        {/* KPIs */}
        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {l:'Faturamento Total',v:formatCurrency(data.total),i:TrendingUp,c:'text-blue-600',b:'bg-blue-50'},
              {l:'Valores Pagos',v:formatCurrency(data.totalPago),i:CheckCircle,c:'text-green-600',b:'bg-green-50'},
              {l:'Valores Pendentes',v:formatCurrency(data.totalPendente),i:Clock,c:'text-orange-600',b:'bg-orange-50'},
            ].map(({l,v,i:Icon,c,b})=>(
              <div key={l} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-500">{l}</p>
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center',b)}>
                    <Icon className={cn('w-5 h-5',c)} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-800">{v}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filtros */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select value={pago} onChange={e=>setPago(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todos</option>
              <option value="true">Pagos</option>
              <option value="false">Pendentes</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">De:</span>
            <input type="date" value={dataInicio} onChange={e=>setDataInicio(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <span className="text-sm text-slate-500">até:</span>
            <input type="date" value={dataFim} onChange={e=>setDataFim(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 font-medium">OS</th>
                <th className="text-left px-5 py-3 font-medium">Cliente</th>
                <th className="text-left px-5 py-3 font-medium">Status OS</th>
                <th className="text-right px-5 py-3 font-medium">Valor</th>
                <th className="text-left px-5 py-3 font-medium">Data</th>
                <th className="text-left px-5 py-3 font-medium">Pagamento</th>
                <th className="text-left px-5 py-3 font-medium">Situação</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="text-center py-8 text-slate-400">Carregando...</td></tr>}
              {!loading && data?.ordens.length===0 && <tr><td colSpan={7} className="text-center py-8 text-slate-400">Nenhum lançamento encontrado</td></tr>}
              {data?.ordens.map(o=>(
                <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/ordens/${o.id}`} className="text-sm font-mono font-semibold text-blue-700 hover:underline">{o.numero}</Link>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-800">{o.cliente.nome}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">{STATUS_LABELS[o.status]}</span>
                  </td>
                  <td className="px-5 py-3 text-sm font-semibold text-slate-800 text-right">{formatCurrency(o.valor)}</td>
                  <td className="px-5 py-3 text-sm text-slate-500">{formatDate(o.dataEntrada)}</td>
                  <td className="px-5 py-3 text-sm text-slate-500">{o.formaPagamento?.replace('_',' ')||'-'}</td>
                  <td className="px-5 py-3">
                    <button onClick={()=>togglePago(o.id,o.pago)}
                      className={cn('px-3 py-1 rounded-full text-xs font-semibold transition-colors', o.pago?'bg-green-100 text-green-800 hover:bg-green-200':'bg-red-100 text-red-800 hover:bg-red-200')}>
                      {o.pago?'Pago':'Pendente'}
                    </button>
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
