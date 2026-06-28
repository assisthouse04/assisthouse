'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import { Plus, Search, Cpu } from 'lucide-react'
import { formatDate, TIPO_EQUIPAMENTO_LABELS } from '@/lib/utils'

interface Equipamento {
  id: string; tipo: string; marca: string; modelo: string; numeroSerie?: string
  estadoFisico?: string; createdAt: string; _count: { ordens: number }
}

const ACESSORIOS = ['Fonte','Cabo','Mochila','Mouse','Teclado','Carregador','Capa','Outros']

export default function EquipamentosPage() {
  const [lista, setLista] = useState<Equipamento[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ tipo:'notebook', marca:'', modelo:'', numeroSerie:'', estadoFisico:'', senha:'', acessorios:'[]', observacoes:'' })
  const [acessSel, setAcessSel] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  async function load(search='') {
    setLoading(true)
    const res = await fetch(`/api/equipamentos?q=${encodeURIComponent(search)}`)
    setLista(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function toggleAcess(a: string) {
    setAcessSel(prev => prev.includes(a) ? prev.filter(x=>x!==a) : [...prev,a])
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/equipamentos', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ ...form, acessorios: JSON.stringify(acessSel) }),
    })
    setSaving(false)
    setShowForm(false)
    setForm({ tipo:'notebook', marca:'', modelo:'', numeroSerie:'', estadoFisico:'', senha:'', acessorios:'[]', observacoes:'' })
    setAcessSel([])
    load()
  }

  return (
    <div className="flex flex-col flex-1">
      <Header title="Equipamentos" subtitle="Registro de equipamentos recebidos" />
      <main className="flex-1 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={q} onChange={e=>{setQ(e.target.value);load(e.target.value)}}
              placeholder="Pesquisar por marca, modelo ou número de série..."
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={()=>setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Novo Equipamento
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading && <p className="text-slate-400 col-span-3 py-8 text-center">Carregando...</p>}
          {!loading && lista.length === 0 && <p className="text-slate-400 col-span-3 py-8 text-center">Nenhum equipamento cadastrado</p>}
          {lista.map(eq => (
            <div key={eq.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-blue-600" />
                </div>
                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                  {TIPO_EQUIPAMENTO_LABELS[eq.tipo] || eq.tipo}
                </span>
              </div>
              <h3 className="font-semibold text-slate-800">{eq.marca} {eq.modelo}</h3>
              {eq.numeroSerie && <p className="text-xs text-slate-500 mt-1 font-mono">S/N: {eq.numeroSerie}</p>}
              {eq.estadoFisico && <p className="text-xs text-slate-500 mt-1">Estado: {eq.estadoFisico}</p>}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-400">{formatDate(eq.createdAt)}</span>
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{eq._count.ordens} OS</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">Novo Equipamento</h2>
              <button onClick={()=>setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo *</label>
                  <select value={form.tipo} onChange={e=>setForm(f=>({...f,tipo:e.target.value}))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {Object.entries(TIPO_EQUIPAMENTO_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Marca *</label>
                  <input value={form.marca} onChange={e=>setForm(f=>({...f,marca:e.target.value}))} required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Modelo *</label>
                  <input value={form.modelo} onChange={e=>setForm(f=>({...f,modelo:e.target.value}))} required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Número de Série</label>
                  <input value={form.numeroSerie} onChange={e=>setForm(f=>({...f,numeroSerie:e.target.value}))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Senha do Equipamento</label>
                  <input type="password" value={form.senha} onChange={e=>setForm(f=>({...f,senha:e.target.value}))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estado Físico na Entrada</label>
                  <input value={form.estadoFisico} onChange={e=>setForm(f=>({...f,estadoFisico:e.target.value}))}
                    placeholder="Ex: Arranhado, sem tampa, tela quebrada..."
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Acessórios Entregues</label>
                  <div className="flex flex-wrap gap-2">
                    {ACESSORIOS.map(a=>(
                      <button key={a} type="button" onClick={()=>toggleAcess(a)}
                        className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${acessSel.includes(a) ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-600 hover:border-blue-300'}`}>
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
                  <textarea rows={2} value={form.observacoes} onChange={e=>setForm(f=>({...f,observacoes:e.target.value}))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={()=>setShowForm(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:bg-blue-300">
                  {saving ? 'Salvando...' : 'Salvar Equipamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
