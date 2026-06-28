'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import { Search, User, Cpu, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { TIPO_EQUIPAMENTO_LABELS, FORMA_PAGAMENTO_LABELS } from '@/lib/utils'

interface Cliente { id:string; nome:string; cpf:string; telefone:string }
interface Equipamento { id:string; marca:string; modelo:string; tipo:string }

const STATUS_OS = ['RECEBIDO','EM_ANALISE','ORCAMENTO']
const GARANTIA_OPTS = ['30 dias','60 dias','90 dias','6 meses','1 ano','Sem garantia']
const ACESSORIOS = ['Fonte','Cabo','Mochila','Mouse','Teclado','Carregador','Capa','Outros']

export default function NovaOSPage() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1=cliente 2=equipamento 3=OS

  // Cliente
  const [clienteQ, setClienteQ] = useState('')
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteSel, setClienteSel] = useState<Cliente|null>(null)
  const [novoCliente, setNovoCliente] = useState(false)
  const [formCliente, setFormCliente] = useState({nome:'',cpf:'',telefone:'',email:'',endereco:'',bairro:'',cidade:'',uf:'PB',cep:'',observacoes:''})

  // Equipamento
  const [equiQ, setEquiQ] = useState('')
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([])
  const [equiSel, setEquiSel] = useState<Equipamento|null>(null)
  const [novoEqui, setNovoEqui] = useState(false)
  const [formEqui, setFormEqui] = useState({tipo:'notebook',marca:'',modelo:'',numeroSerie:'',estadoFisico:'',senha:'',observacoes:''})
  const [acessSel, setAcessSel] = useState<string[]>([])

  // OS
  const [formOS, setFormOS] = useState({
    defeito:'', diagnostico:'', servicoExecutado:'', pecasUtilizadas:'',
    valor:'0', formaPagamento:'pix', garantia:'90 dias', observacoes:'', status:'RECEBIDO',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (clienteQ.length > 1) {
      fetch(`/api/clientes?q=${encodeURIComponent(clienteQ)}`).then(r=>r.json()).then(setClientes)
    } else setClientes([])
  }, [clienteQ])

  useEffect(() => {
    if (equiQ.length > 1) {
      fetch(`/api/equipamentos?q=${encodeURIComponent(equiQ)}`).then(r=>r.json()).then(setEquipamentos)
    } else setEquipamentos([])
  }, [equiQ])

  async function salvarCliente() {
    const res = await fetch('/api/clientes', {
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(formCliente),
    })
    const data = await res.json()
    if (res.ok || res.status === 409) {
      setClienteSel(res.status===409 ? data.cliente : data)
      setNovoCliente(false)
      setStep(2)
    } else setError(data.error)
  }

  async function salvarEquipamento() {
    const res = await fetch('/api/equipamentos', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({...formEqui, acessorios:JSON.stringify(acessSel)}),
    })
    const data = await res.json()
    if (res.ok) { setEquiSel(data); setNovoEqui(false); setStep(3) }
    else setError(data.error)
  }

  async function handleSalvarOS(e:React.FormEvent) {
    e.preventDefault()
    if (!clienteSel || !equiSel) return
    setSaving(true); setError('')
    const res = await fetch('/api/ordens', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        clienteId: clienteSel.id,
        equipamentoId: equiSel.id,
        ...formOS,
        valor: parseFloat(formOS.valor) || 0,
      }),
    })
    setSaving(false)
    if (res.ok) {
      const data = await res.json()
      router.push(`/ordens/${data.id}`)
    } else {
      const d = await res.json(); setError(d.error)
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <Header title="Nova Ordem de Serviço" subtitle="Preencha as informações abaixo" />
      <main className="flex-1 p-6 max-w-3xl">

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {[{n:1,l:'Cliente'},{n:2,l:'Equipamento'},{n:3,l:'Ordem de Serviço'}].map(({n,l})=>(
            <div key={n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step>=n ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{n}</div>
              <span className={`text-sm ${step>=n ? 'text-blue-700 font-medium' : 'text-slate-400'}`}>{l}</span>
              {n<3 && <div className={`w-8 h-px ${step>n ? 'bg-blue-600' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

        {/* STEP 1: Cliente */}
        {step===1 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2"><User className="w-5 h-5 text-blue-600" /> Selecionar Cliente</h2>

            {clienteSel ? (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-semibold text-blue-900">{clienteSel.nome}</p>
                  <p className="text-sm text-blue-700">{clienteSel.cpf} · {clienteSel.telefone}</p>
                </div>
                <button onClick={()=>{setClienteSel(null);setClienteQ('')}} className="text-blue-600 text-sm hover:underline">Trocar</button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input value={clienteQ} onChange={e=>setClienteQ(e.target.value)}
                    placeholder="Pesquisar cliente por nome, CPF ou telefone..."
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                {clientes.length>0 && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    {clientes.map(c=>(
                      <button key={c.id} onClick={()=>{setClienteSel(c);setClientes([]);setClienteQ('')}}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-slate-100 last:border-0 transition-colors">
                        <p className="font-medium text-slate-800">{c.nome}</p>
                        <p className="text-xs text-slate-500">{c.cpf} · {c.telefone}</p>
                      </button>
                    ))}
                  </div>
                )}
                <div className="text-center pt-2">
                  <button onClick={()=>setNovoCliente(!novoCliente)} className="text-sm text-blue-600 hover:underline">
                    + Cadastrar novo cliente
                  </button>
                </div>
              </>
            )}

            {novoCliente && (
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h3 className="text-sm font-semibold text-slate-700">Dados do novo cliente</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><input value={formCliente.nome} onChange={e=>setFormCliente(f=>({...f,nome:e.target.value}))} placeholder="Nome completo *" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                  <input value={formCliente.cpf} onChange={e=>setFormCliente(f=>({...f,cpf:e.target.value}))} placeholder="CPF *" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input value={formCliente.telefone} onChange={e=>setFormCliente(f=>({...f,telefone:e.target.value}))} placeholder="Telefone/WhatsApp *" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <div className="col-span-2"><input type="email" value={formCliente.email} onChange={e=>setFormCliente(f=>({...f,email:e.target.value}))} placeholder="E-mail" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                  <div className="col-span-2"><input value={formCliente.endereco} onChange={e=>setFormCliente(f=>({...f,endereco:e.target.value}))} placeholder="Endereço" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                  <input value={formCliente.cidade} onChange={e=>setFormCliente(f=>({...f,cidade:e.target.value}))} placeholder="Cidade" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input value={formCliente.uf} onChange={e=>setFormCliente(f=>({...f,uf:e.target.value}))} placeholder="UF" maxLength={2} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button onClick={salvarCliente} className="w-full py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">Salvar e continuar</button>
              </div>
            )}

            {clienteSel && (
              <button onClick={()=>setStep(2)} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                Continuar →
              </button>
            )}
          </div>
        )}

        {/* STEP 2: Equipamento */}
        {step===2 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2"><Cpu className="w-5 h-5 text-blue-600" /> Selecionar Equipamento</h2>

            {equiSel ? (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-semibold text-blue-900">{equiSel.marca} {equiSel.modelo}</p>
                  <p className="text-sm text-blue-700">{TIPO_EQUIPAMENTO_LABELS[equiSel.tipo]}</p>
                </div>
                <button onClick={()=>{setEquiSel(null);setEquiQ('')}} className="text-blue-600 text-sm hover:underline">Trocar</button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input value={equiQ} onChange={e=>setEquiQ(e.target.value)}
                    placeholder="Pesquisar equipamento por marca, modelo ou S/N..."
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                {equipamentos.length>0 && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    {equipamentos.map(eq=>(
                      <button key={eq.id} onClick={()=>{setEquiSel(eq);setEquipamentos([]);setEquiQ('')}}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-slate-100 last:border-0 transition-colors">
                        <p className="font-medium text-slate-800">{eq.marca} {eq.modelo}</p>
                        <p className="text-xs text-slate-500">{TIPO_EQUIPAMENTO_LABELS[eq.tipo]}</p>
                      </button>
                    ))}
                  </div>
                )}
                <div className="text-center pt-2">
                  <button onClick={()=>setNovoEqui(!novoEqui)} className="text-sm text-blue-600 hover:underline">
                    + Cadastrar novo equipamento
                  </button>
                </div>
              </>
            )}

            {novoEqui && (
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h3 className="text-sm font-semibold text-slate-700">Dados do equipamento</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <select value={formEqui.tipo} onChange={e=>setFormEqui(f=>({...f,tipo:e.target.value}))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {Object.entries(TIPO_EQUIPAMENTO_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <input value={formEqui.marca} onChange={e=>setFormEqui(f=>({...f,marca:e.target.value}))} placeholder="Marca *" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input value={formEqui.modelo} onChange={e=>setFormEqui(f=>({...f,modelo:e.target.value}))} placeholder="Modelo *" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input value={formEqui.numeroSerie} onChange={e=>setFormEqui(f=>({...f,numeroSerie:e.target.value}))} placeholder="Número de Série" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="password" value={formEqui.senha} onChange={e=>setFormEqui(f=>({...f,senha:e.target.value}))} placeholder="Senha (protegida)" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <div className="col-span-2"><input value={formEqui.estadoFisico} onChange={e=>setFormEqui(f=>({...f,estadoFisico:e.target.value}))} placeholder="Estado físico na entrada" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                  <div className="col-span-2">
                    <p className="text-xs font-medium text-slate-600 mb-2">Acessórios entregues:</p>
                    <div className="flex flex-wrap gap-2">
                      {ACESSORIOS.map(a=>(
                        <button key={a} type="button" onClick={()=>setAcessSel(prev=>prev.includes(a)?prev.filter(x=>x!==a):[...prev,a])}
                          className={`px-3 py-1 rounded-full text-xs border transition-colors ${acessSel.includes(a)?'bg-blue-600 text-white border-blue-600':'border-slate-200 text-slate-600 hover:border-blue-300'}`}>
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={salvarEquipamento} className="w-full py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">Salvar equipamento e continuar</button>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={()=>setStep(1)} className="flex items-center gap-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 hover:bg-slate-50">
                <ChevronLeft className="w-4 h-4" /> Voltar
              </button>
              {equiSel && (
                <button onClick={()=>setStep(3)} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                  Continuar →
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: OS */}
        {step===3 && (
          <form onSubmit={handleSalvarOS} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">Dados da Ordem de Serviço</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Defeito informado pelo cliente *</label>
                <textarea rows={3} value={formOS.defeito} onChange={e=>setFormOS(f=>({...f,defeito:e.target.value}))} required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Diagnóstico técnico</label>
                <textarea rows={2} value={formOS.diagnostico} onChange={e=>setFormOS(f=>({...f,diagnostico:e.target.value}))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Serviço a executar / Executado</label>
                <textarea rows={2} value={formOS.servicoExecutado} onChange={e=>setFormOS(f=>({...f,servicoExecutado:e.target.value}))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Peças utilizadas</label>
                <input value={formOS.pecasUtilizadas} onChange={e=>setFormOS(f=>({...f,pecasUtilizadas:e.target.value}))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                <input type="number" step="0.01" min="0" value={formOS.valor} onChange={e=>setFormOS(f=>({...f,valor:e.target.value}))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Forma de Pagamento</label>
                <select value={formOS.formaPagamento} onChange={e=>setFormOS(f=>({...f,formaPagamento:e.target.value}))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {Object.entries(FORMA_PAGAMENTO_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Garantia</label>
                <select value={formOS.garantia} onChange={e=>setFormOS(f=>({...f,garantia:e.target.value}))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {GARANTIA_OPTS.map(g=><option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status inicial</label>
                <select value={formOS.status} onChange={e=>setFormOS(f=>({...f,status:e.target.value}))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {STATUS_OS.map(s=><option key={s} value={s}>{s.replace('_',' ')}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
                <textarea rows={2} value={formOS.observacoes} onChange={e=>setFormOS(f=>({...f,observacoes:e.target.value}))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={()=>setStep(2)} className="flex items-center gap-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 hover:bg-slate-50">
                <ChevronLeft className="w-4 h-4" /> Voltar
              </button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition-colors">
                {saving ? 'Salvando...' : 'Criar Ordem de Serviço'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
