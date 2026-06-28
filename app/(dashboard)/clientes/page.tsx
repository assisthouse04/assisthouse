'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Link from 'next/link'
import { Plus, Search, User, Phone, Mail, Trash2, Edit } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useSession } from 'next-auth/react'

interface Cliente {
  id: string; nome: string; cpf: string; telefone: string; email?: string
  cidade?: string; uf?: string; createdAt: string; _count: { ordens: number }
}

export default function ClientesPage() {
  const { data: session } = useSession()
  const isAdmin = (session?.user as any)?.role === 'ADMIN'
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nome:'', cpf:'', telefone:'', email:'', endereco:'', bairro:'', cidade:'', uf:'', cep:'', observacoes:'' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load(search = '') {
    setLoading(true)
    const res = await fetch(`/api/clientes?q=${encodeURIComponent(search)}`)
    const data = await res.json()
    setClientes(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    const res = await fetch('/api/clientes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) { setShowForm(false); setForm({ nome:'', cpf:'', telefone:'', email:'', endereco:'', bairro:'', cidade:'', uf:'', cep:'', observacoes:'' }); load() }
    else { const d = await res.json(); setError(d.error || 'Erro ao salvar') }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este cliente?')) return
    await fetch(`/api/clientes/${id}`, { method: 'DELETE' })
    load(q)
  }

  return (
    <div className="flex flex-col flex-1">
      <Header title="Clientes" subtitle="Cadastro de clientes" />
      <main className="flex-1 p-6">

        {/* Barra de ações */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={q}
              onChange={e => { setQ(e.target.value); load(e.target.value) }}
              placeholder="Pesquisar por nome, CPF ou telefone..."
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Novo Cliente
          </button>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-slate-100 bg-slate-50">
                <th className="text-left px-6 py-3 font-medium">Nome</th>
                <th className="text-left px-6 py-3 font-medium">CPF</th>
                <th className="text-left px-6 py-3 font-medium">Telefone</th>
                <th className="text-left px-6 py-3 font-medium">Cidade</th>
                <th className="text-left px-6 py-3 font-medium">OS</th>
                <th className="text-left px-6 py-3 font-medium">Cadastro</th>
                <th className="text-left px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400">Carregando...</td></tr>
              )}
              {!loading && clientes.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400">Nenhum cliente encontrado</td></tr>
              )}
              {clientes.map(c => (
                <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{c.nome}</p>
                        {c.email && <p className="text-xs text-slate-400">{c.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-600 font-mono">{c.cpf}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{c.telefone}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{c.cidade}{c.uf ? `/${c.uf}` : ''}</td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{c._count.ordens}</span>
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-500">{formatDate(c.createdAt)}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/clientes/${c.id}`} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                        <Edit className="w-4 h-4 text-slate-500" />
                      </Link>
                      {isAdmin && (
                        <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal Novo Cliente */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">Novo Cliente</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome completo *</label>
                  <input value={form.nome} onChange={e=>setForm(f=>({...f,nome:e.target.value}))} required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CPF *</label>
                  <input value={form.cpf} onChange={e=>setForm(f=>({...f,cpf:e.target.value}))} required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="000.000.000-00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telefone/WhatsApp *</label>
                  <input value={form.telefone} onChange={e=>setForm(f=>({...f,telefone:e.target.value}))} required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="(83) 99999-9999" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                  <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Endereço</label>
                  <input value={form.endereco} onChange={e=>setForm(f=>({...f,endereco:e.target.value}))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bairro</label>
                  <input value={form.bairro} onChange={e=>setForm(f=>({...f,bairro:e.target.value}))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CEP</label>
                  <input value={form.cep} onChange={e=>setForm(f=>({...f,cep:e.target.value}))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cidade</label>
                  <input value={form.cidade} onChange={e=>setForm(f=>({...f,cidade:e.target.value}))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">UF</label>
                  <input value={form.uf} onChange={e=>setForm(f=>({...f,uf:e.target.value}))} maxLength={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="PB" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
                  <textarea rows={2} value={form.observacoes} onChange={e=>setForm(f=>({...f,observacoes:e.target.value}))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:bg-blue-300">
                  {saving ? 'Salvando...' : 'Salvar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
