'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import { Plus, UserCog, Shield, Wrench, ToggleLeft, ToggleRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface User { id:string;name:string;email:string;role:string;active:boolean;createdAt:string }

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({name:'',email:'',password:'',userRole:'TECNICO'})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    const res = await fetch('/api/usuarios')
    if (res.ok) setUsers(await res.json())
    setLoading(false)
  }

  useEffect(()=>{load()},[])

  async function handleSave(e:React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('')
    const res = await fetch('/api/usuarios',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    setSaving(false)
    if(res.ok){setShowForm(false);setForm({name:'',email:'',password:'',userRole:'TECNICO'});load()}
    else{const d=await res.json();setError(d.error||'Erro ao salvar')}
  }

  async function toggleAtivo(user:User) {
    await fetch('/api/usuarios',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:user.id,name:user.name,email:user.email,userRole:user.role,active:!user.active})})
    load()
  }

  return (
    <div className="flex flex-col flex-1">
      <Header title="Usuários" subtitle="Gestão de usuários e permissões" />
      <main className="flex-1 p-6">
        <div className="flex justify-end mb-6">
          <button onClick={()=>setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Novo Usuário
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading && <p className="text-slate-400 col-span-3 py-8 text-center">Carregando...</p>}
          {users.map(u=>(
            <div key={u.id} className={`bg-white rounded-xl p-5 shadow-sm border ${u.active?'border-slate-100':'border-red-100 bg-red-50/30'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${u.role==='ADMIN'?'bg-blue-100':'bg-green-100'}`}>
                  {u.role==='ADMIN'?<Shield className="w-5 h-5 text-blue-600" />:<Wrench className="w-5 h-5 text-green-600" />}
                </div>
                <button onClick={()=>toggleAtivo(u)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                  {u.active?<ToggleRight className="w-6 h-6 text-green-500" />:<ToggleLeft className="w-6 h-6 text-slate-300" />}
                </button>
              </div>
              <h3 className="font-semibold text-slate-800">{u.name}</h3>
              <p className="text-sm text-slate-500">{u.email}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role==='ADMIN'?'bg-blue-100 text-blue-800':'bg-green-100 text-green-800'}`}>
                  {u.role==='ADMIN'?'Administrador':'Técnico'}
                </span>
                <span className="text-xs text-slate-400">{formatDate(u.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">Novo Usuário</h2>
              <button onClick={()=>setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome *</label>
                <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-mail *</label>
                <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Senha *</label>
                <input type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} required minLength={6} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Perfil *</label>
                <select value={form.userRole} onChange={e=>setForm(f=>({...f,userRole:e.target.value}))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="TECNICO">Técnico</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={()=>setShowForm(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:bg-blue-300">
                  {saving?'Salvando...':'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
