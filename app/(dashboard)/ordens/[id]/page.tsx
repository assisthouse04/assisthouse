'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  ChevronLeft, FileText, MessageCircle, Save, Printer, CheckCircle,
} from 'lucide-react'
import {
  formatDateTime, formatCurrency,
  STATUS_LABELS, STATUS_COLORS, FORMA_PAGAMENTO_LABELS, TIPO_EQUIPAMENTO_LABELS,
} from '@/lib/utils'
import { cn } from '@/lib/utils'

const ALL_STATUS = ['RECEBIDO','EM_ANALISE','ORCAMENTO','ORCAMENTO_APROVADO','AGUARDANDO_PECAS','EM_MANUTENCAO','PRONTO','FINALIZADO','ENTREGUE','CANCELADO']
const ADMIN_STATUS = ALL_STATUS
const TECNICO_STATUS = ['RECEBIDO','EM_ANALISE','ORCAMENTO','ORCAMENTO_APROVADO','AGUARDANDO_PECAS','EM_MANUTENCAO','PRONTO']

interface OS {
  id:string; numero:string; status:string; defeito:string; diagnostico?:string; servicoExecutado?:string
  pecasUtilizadas?:string; valor:number; formaPagamento?:string; garantia?:string; observacoes?:string
  pago:boolean; dataEntrada:string; dataConclusao?:string; dataEntrega?:string
  cliente:{id:string;nome:string;cpf:string;telefone:string;email?:string;endereco?:string;cidade?:string;uf?:string}
  equipamento:{id:string;marca:string;modelo:string;tipo:string;numeroSerie?:string;estadoFisico?:string;acessorios?:string}
  tecnico?:{id:string;name:string}
}

export default function OSDetailPage() {
  const { id } = useParams<{id:string}>()
  const router = useRouter()
  const { data: session } = useSession()
  const isAdmin = (session?.user as any)?.role === 'ADMIN'

  const [os, setOs] = useState<OS|null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<OS>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/ordens/${id}`).then(r=>r.json()).then(data => {
      setOs(data); setForm(data); setLoading(false)
    })
  }, [id])

  async function handleSave() {
    setSaving(true)
    const res = await fetch(`/api/ordens/${id}`, {
      method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) { const data = await res.json(); setOs(data); setForm(data); setEditing(false) }
  }

  async function handlePago() {
    const res = await fetch(`/api/ordens/${id}`, {
      method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ pago: !os?.pago, dataPagamento: !os?.pago ? new Date().toISOString() : null }),
    })
    if (res.ok) { const data = await res.json(); setOs(data) }
  }

  function gerarPDF() {
    if (!os) return
    import('jspdf').then(async ({ jsPDF }) => {
      const { default: autoTable } = await import('jspdf-autotable')
      const doc = new jsPDF()
      const pageW = doc.internal.pageSize.getWidth()

      // Cabeçalho
      doc.setFillColor(30, 64, 175)
      doc.rect(0, 0, pageW, 35, 'F')
      doc.setTextColor(255,255,255)
      doc.setFontSize(18)
      doc.setFont('helvetica','bold')
      doc.text('ASSISTHOUSE INFORMÁTICA', 14, 15)
      doc.setFontSize(9)
      doc.setFont('helvetica','normal')
      doc.text('Av. Bahia, 630, Sala 5, Bairro dos Estados, João Pessoa/PB', 14, 22)
      doc.text('Telefone: (83) 98821-4778', 14, 28)
      doc.setTextColor(255,215,0)
      doc.setFontSize(11)
      doc.setFont('helvetica','bold')
      doc.text(`ORDEM DE SERVIÇO Nº ${os.numero}`, pageW-14, 18, {align:'right'})
      doc.setTextColor(255,255,255)
      doc.setFontSize(9)
      doc.setFont('helvetica','normal')
      doc.text(`Data: ${formatDateTime(os.dataEntrada)}`, pageW-14, 26, {align:'right'})
      doc.text(`Status: ${STATUS_LABELS[os.status]}`, pageW-14, 31, {align:'right'})

      doc.setTextColor(30,30,30)
      let y = 45

      // Dados do cliente
      doc.setFontSize(11)
      doc.setFont('helvetica','bold')
      doc.setFillColor(241,245,249)
      doc.rect(14, y-5, pageW-28, 8, 'F')
      doc.text('DADOS DO CLIENTE', 16, y)
      y += 6
      doc.setFont('helvetica','normal')
      doc.setFontSize(9)
      autoTable(doc, {
        startY: y,
        head:[],
        body:[
          ['Nome:', os.cliente.nome, 'CPF:', os.cliente.cpf],
          ['Telefone:', os.cliente.telefone, 'E-mail:', os.cliente.email||'-'],
          ['Endereço:', `${os.cliente.endereco||'-'}, ${os.cliente.cidade||''}/${os.cliente.uf||''}`, '', ''],
        ],
        theme:'plain',
        styles:{fontSize:9,cellPadding:2},
        columnStyles:{0:{fontStyle:'bold',cellWidth:30},2:{fontStyle:'bold',cellWidth:25}},
        margin:{left:14,right:14},
      })
      y = (doc as any).lastAutoTable.finalY + 6

      // Dados do equipamento
      doc.setFontSize(11)
      doc.setFont('helvetica','bold')
      doc.setFillColor(241,245,249)
      doc.rect(14, y-5, pageW-28, 8, 'F')
      doc.text('DADOS DO EQUIPAMENTO', 16, y)
      y += 6
      const acessorios = os.equipamento.acessorios ? JSON.parse(os.equipamento.acessorios).join(', ') : '-'
      autoTable(doc, {
        startY: y,
        head:[],
        body:[
          ['Tipo:', TIPO_EQUIPAMENTO_LABELS[os.equipamento.tipo], 'Marca:', os.equipamento.marca],
          ['Modelo:', os.equipamento.modelo, 'Nº Série:', os.equipamento.numeroSerie||'-'],
          ['Estado físico:', os.equipamento.estadoFisico||'-', 'Acessórios:', acessorios],
        ],
        theme:'plain',
        styles:{fontSize:9,cellPadding:2},
        columnStyles:{0:{fontStyle:'bold',cellWidth:30},2:{fontStyle:'bold',cellWidth:25}},
        margin:{left:14,right:14},
      })
      y = (doc as any).lastAutoTable.finalY + 6

      // Serviço
      doc.setFontSize(11)
      doc.setFont('helvetica','bold')
      doc.setFillColor(241,245,249)
      doc.rect(14, y-5, pageW-28, 8, 'F')
      doc.text('SERVIÇO', 16, y)
      y += 6
      autoTable(doc, {
        startY: y,
        head:[],
        body:[
          ['Defeito informado:', os.defeito],
          ['Diagnóstico:', os.diagnostico||'-'],
          ['Serviço executado:', os.servicoExecutado||'-'],
          ['Peças utilizadas:', os.pecasUtilizadas||'-'],
          ['Valor:', formatCurrency(os.valor)],
          ['Forma de pagamento:', FORMA_PAGAMENTO_LABELS[os.formaPagamento||'']||'-'],
          ['Garantia:', os.garantia||'-'],
        ],
        theme:'plain',
        styles:{fontSize:9,cellPadding:2},
        columnStyles:{0:{fontStyle:'bold',cellWidth:50}},
        margin:{left:14,right:14},
      })
      y = (doc as any).lastAutoTable.finalY + 10

      // Termo de recebimento
      if (y > 230) { doc.addPage(); y = 20 }
      doc.setFillColor(254,243,199)
      doc.rect(14, y-5, pageW-28, 22, 'F')
      doc.setFontSize(9)
      doc.setFont('helvetica','bold')
      doc.text('TERMO DE RECEBIMENTO E AUTORIZAÇÃO', 16, y)
      y += 6
      doc.setFont('helvetica','normal')
      const termo = 'Declaro que entreguei o equipamento acima descrito para avaliação técnica e autorizo a realização de diagnóstico e serviços necessários mediante aprovação prévia do orçamento.'
      const lines = doc.splitTextToSize(termo, pageW-30)
      doc.text(lines, 16, y)
      y += lines.length * 5 + 15

      // Assinaturas
      if (y > 250) { doc.addPage(); y = 20 }
      const mid = pageW / 2
      doc.setLineWidth(0.5)
      doc.line(14, y, mid-10, y)
      doc.line(mid+10, y, pageW-14, y)
      y += 5
      doc.setFontSize(8)
      doc.setFont('helvetica','normal')
      doc.text('Assinatura do Cliente', 14, y)
      doc.text('Data: ___/___/_____', 14, y+5)
      doc.text('Assinatura ASSISTHOUSE Informática', mid+10, y)
      doc.text('Data: ___/___/_____', mid+10, y+5)

      doc.save(`OS-${os.numero}.pdf`)
    })
  }

  function compartilharWhatsApp() {
    if (!os) return
    const tel = os.cliente.telefone.replace(/\D/g,'')
    const msg = encodeURIComponent(
      `Olá, ${os.cliente.nome}! 👋\n\n` +
      `Sua Ordem de Serviço *${os.numero}* está com status: *${STATUS_LABELS[os.status]}*.\n\n` +
      `📱 Equipamento: ${os.equipamento.marca} ${os.equipamento.modelo}\n` +
      `🔧 Defeito: ${os.defeito}\n` +
      `💰 Valor: ${formatCurrency(os.valor)}\n\n` +
      `ASSISTHOUSE Informática | (83) 98821-4778`
    )
    window.open(`https://wa.me/55${tel}?text=${msg}`, '_blank')
  }

  if (loading) return <div className="flex-1 flex items-center justify-center"><p className="text-slate-400">Carregando...</p></div>
  if (!os) return <div className="flex-1 flex items-center justify-center"><p className="text-red-500">OS não encontrada</p></div>

  const statusList = isAdmin ? ADMIN_STATUS : TECNICO_STATUS

  return (
    <div className="flex flex-col flex-1">
      <Header title={`OS ${os.numero}`} subtitle={`${os.cliente.nome} · ${os.equipamento.marca} ${os.equipamento.modelo}`} />
      <main className="flex-1 p-6 max-w-4xl">

        {/* Barra de ações */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <Link href="/ordens" className="flex items-center gap-1 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50">
            <ChevronLeft className="w-4 h-4" /> Voltar
          </Link>
          <span className={cn('px-3 py-1 rounded-full text-sm font-semibold', STATUS_COLORS[os.status])}>
            {STATUS_LABELS[os.status]}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={compartilharWhatsApp} className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </button>
            <button onClick={gerarPDF} className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-800 transition-colors">
              <FileText className="w-4 h-4" /> PDF
            </button>
            {!editing ? (
              <button onClick={()=>setEditing(true)} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                Editar
              </button>
            ) : (
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:bg-blue-300 transition-colors">
                <Save className="w-4 h-4" /> {saving?'Salvando...':'Salvar'}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-4">

            {/* Status */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Status da OS</h3>
              <div className="flex flex-wrap gap-2">
                {statusList.map(s=>(
                  <button key={s} onClick={()=>editing&&setForm(f=>({...f,status:s}))}
                    className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                      (editing?form.status:os.status)===s ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 text-slate-600 hover:border-blue-300',
                      !editing && 'cursor-default'
                    )}>
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Defeito / Diagnóstico */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 space-y-4">
              <h3 className="text-sm font-semibold text-slate-700">Informações do Serviço</h3>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Defeito informado</label>
                {editing ? (
                  <textarea rows={3} value={form.defeito||''} onChange={e=>setForm(f=>({...f,defeito:e.target.value}))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                ) : <p className="text-sm text-slate-800 bg-slate-50 rounded-lg p-3">{os.defeito}</p>}
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Diagnóstico técnico</label>
                {editing ? (
                  <textarea rows={2} value={form.diagnostico||''} onChange={e=>setForm(f=>({...f,diagnostico:e.target.value}))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                ) : <p className="text-sm text-slate-800 bg-slate-50 rounded-lg p-3">{os.diagnostico||'-'}</p>}
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Serviço executado</label>
                {editing ? (
                  <textarea rows={2} value={form.servicoExecutado||''} onChange={e=>setForm(f=>({...f,servicoExecutado:e.target.value}))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                ) : <p className="text-sm text-slate-800 bg-slate-50 rounded-lg p-3">{os.servicoExecutado||'-'}</p>}
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Peças utilizadas</label>
                {editing ? (
                  <input value={form.pecasUtilizadas||''} onChange={e=>setForm(f=>({...f,pecasUtilizadas:e.target.value}))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                ) : <p className="text-sm text-slate-800 bg-slate-50 rounded-lg p-3">{os.pecasUtilizadas||'-'}</p>}
              </div>
            </div>

          </div>

          {/* Coluna lateral */}
          <div className="space-y-4">

            {/* Cliente */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Cliente</h3>
              <p className="font-semibold text-slate-800">{os.cliente.nome}</p>
              <p className="text-sm text-slate-600 mt-1">{os.cliente.cpf}</p>
              <p className="text-sm text-slate-600">{os.cliente.telefone}</p>
              {os.cliente.email && <p className="text-sm text-slate-600">{os.cliente.email}</p>}
              {os.cliente.endereco && <p className="text-sm text-slate-500 mt-2">{os.cliente.endereco}, {os.cliente.cidade}/{os.cliente.uf}</p>}
            </div>

            {/* Equipamento */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Equipamento</h3>
              <p className="font-semibold text-slate-800">{os.equipamento.marca} {os.equipamento.modelo}</p>
              <p className="text-sm text-slate-600">{TIPO_EQUIPAMENTO_LABELS[os.equipamento.tipo]}</p>
              {os.equipamento.numeroSerie && <p className="text-xs text-slate-500 font-mono mt-1">S/N: {os.equipamento.numeroSerie}</p>}
              {os.equipamento.estadoFisico && <p className="text-xs text-slate-500 mt-1">Estado: {os.equipamento.estadoFisico}</p>}
              {os.equipamento.acessorios && (
                <div className="mt-2">
                  <p className="text-xs text-slate-400 mb-1">Acessórios:</p>
                  <div className="flex flex-wrap gap-1">
                    {JSON.parse(os.equipamento.acessorios).map((a:string)=>(
                      <span key={a} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">{a}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Financeiro */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Financeiro</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Valor</span>
                  {editing && isAdmin ? (
                    <input type="number" step="0.01" value={form.valor||0} onChange={e=>setForm(f=>({...f,valor:parseFloat(e.target.value)}))}
                      className="w-28 border border-slate-200 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  ) : <span className="font-semibold text-slate-800">{formatCurrency(os.valor)}</span>}
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Pagamento</span>
                  <span className="text-sm text-slate-800">{FORMA_PAGAMENTO_LABELS[os.formaPagamento||'']||'-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Garantia</span>
                  <span className="text-sm text-slate-800">{os.garantia||'-'}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-sm font-medium text-slate-700">Pago</span>
                  {isAdmin ? (
                    <button onClick={handlePago}
                      className={cn('px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors', os.pago ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200')}>
                      {os.pago && <CheckCircle className="w-3 h-3" />}
                      {os.pago ? 'Pago' : 'Pendente'}
                    </button>
                  ) : (
                    <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', os.pago ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                      {os.pago ? 'Pago' : 'Pendente'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Datas */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Datas</h3>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Entrada</span>
                  <span className="text-slate-800">{formatDateTime(os.dataEntrada)}</span>
                </div>
                {os.tecnico && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Técnico</span>
                    <span className="text-slate-800">{os.tecnico.name}</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
