'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import { BarChart3, Users, FileText, DollarSign, TrendingUp } from 'lucide-react'
import { formatCurrency, STATUS_LABELS } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Data {
  totalClientes: number
  totalOS: number
  osPorStatus: { status: string; _count: { _all: number } }[]
  faturamento: { total: number; qtd: number }
  osPorMes: { mes: string; total: number; faturamento: number }[]
}

export default function RelatoriosPage() {
  const [data, setData] = useState<Data|null>(null)
  const [loading, setLoading] = useState(true)
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  async function load() {
    setLoading(true)
    const p = new URLSearchParams()
    if (dataInicio) p.set('dataInicio', dataInicio)
    if (dataFim) p.set('dataFim', dataFim)
    const res = await fetch(`/api/relatorios?${p}`)
    setData(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [dataInicio, dataFim])

  return (
    <div className="flex flex-col flex-1">
      <Header title="Relatórios" subtitle="Painel administrativo e estatísticas" />
      <main className="flex-1 p-6 space-y-6">

        {/* Filtro de período */}
        <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-slate-700">Período:</span>
          <input type="date" value={dataInicio} onChange={e=>setDataInicio(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <span className="text-slate-400">até</span>
          <input type="date" value={dataFim} onChange={e=>setDataFim(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button onClick={()=>{setDataInicio('');setDataFim('')}} className="text-xs text-slate-400 hover:text-slate-600 ml-2">Limpar filtro</button>
        </div>

        {loading ? (
          <p className="text-center text-slate-400 py-8">Carregando...</p>
        ) : data && (
          <>
            {/* Resumo geral */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {l:'Clientes',v:data.totalClientes,i:Users,c:'text-blue-600',b:'bg-blue-50'},
                {l:'Total de OS',v:data.totalOS,i:FileText,c:'text-purple-600',b:'bg-purple-50'},
                {l:'OS Pagas',v:data.faturamento.qtd,i:TrendingUp,c:'text-green-600',b:'bg-green-50'},
                {l:'Faturamento',v:formatCurrency(data.faturamento.total),i:DollarSign,c:'text-yellow-600',b:'bg-yellow-50'},
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* OS por Status */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">OS por Status</h3>
                <div className="space-y-3">
                  {data.osPorStatus.sort((a,b)=>b._count._all-a._count._all).map(s=>{
                    const pct = data.totalOS > 0 ? (s._count._all / data.totalOS * 100).toFixed(0) : 0
                    return (
                      <div key={s.status}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-700">{STATUS_LABELS[s.status]}</span>
                          <span className="font-semibold text-slate-800">{s._count._all} ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full transition-all" style={{width:`${pct}%`}} />
                        </div>
                      </div>
                    )
                  })}
                  {data.osPorStatus.length===0 && <p className="text-slate-400 text-sm">Nenhuma OS no período</p>}
                </div>
              </div>

              {/* OS por Mês */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">OS por Mês (últimos 6)</h3>
                <div className="space-y-3">
                  {(data.osPorMes as any[]).map((m: any) => (
                    <div key={m.mes} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 w-20">{m.mes}</span>
                      <div className="flex-1 mx-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{width:`${Math.min(100,(m.total/Math.max(...(data.osPorMes as any[]).map((x:any)=>x.total)))*100)}%`}} />
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-slate-800">{m.total} OS</span>
                        <p className="text-xs text-green-600">{formatCurrency(Number(m.faturamento)||0)}</p>
                      </div>
                    </div>
                  ))}
                  {data.osPorMes.length===0 && <p className="text-slate-400 text-sm">Nenhum dado disponível</p>}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
