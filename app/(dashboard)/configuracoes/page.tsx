'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import { Save, Building2 } from 'lucide-react'

interface Config { chave:string; valor:string }

const CAMPOS = [
  {chave:'empresa_nome',label:'Nome da Empresa',placeholder:'ASSISTHOUSE INFORMÁTICA'},
  {chave:'empresa_endereco',label:'Endereço',placeholder:'Av. Bahia, 630, Sala 5...'},
  {chave:'empresa_telefone',label:'Telefone/WhatsApp',placeholder:'(83) 98821-4778'},
  {chave:'empresa_email',label:'E-mail da Empresa',placeholder:'contato@assisthouse.com'},
  {chave:'empresa_cnpj',label:'CNPJ',placeholder:'00.000.000/0001-00'},
]

export default function ConfiguracoesPage() {
  const [configs, setConfigs] = useState<Record<string,string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/configuracoes').then(r=>r.json()).then((data:Config[])=>{
      const map: Record<string,string> = {}
      data.forEach(c => { map[c.chave]=c.valor })
      setConfigs(map)
      setLoading(false)
    }).catch(()=>setLoading(false))
  }, [])

  async function handleSave(e:React.FormEvent) {
    e.preventDefault(); setSaving(true)
    await fetch('/api/configuracoes',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(configs)})
    setSaving(false); setSaved(true)
    setTimeout(()=>setSaved(false),3000)
  }

  return (
    <div className="flex flex-col flex-1">
      <Header title="Configurações" subtitle="Dados da empresa e preferências do sistema" />
      <main className="flex-1 p-6 max-w-2xl">
        {loading ? (
          <p className="text-slate-400">Carregando...</p>
        ) : (
          <form onSubmit={handleSave} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Dados da Empresa</h3>
                <p className="text-xs text-slate-500">Informações que aparecem nos PDFs e documentos</p>
              </div>
            </div>

            {CAMPOS.map(({chave,label,placeholder})=>(
              <div key={chave}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                <input
                  value={configs[chave]||''}
                  onChange={e=>setConfigs(c=>({...c,[chave]:e.target.value}))}
                  placeholder={placeholder}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300 transition-colors">
                <Save className="w-4 h-4" /> {saving?'Salvando...':'Salvar Configurações'}
              </button>
              {saved && <span className="text-sm text-green-600 font-medium">✓ Salvo com sucesso!</span>}
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
