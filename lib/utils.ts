import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return '-'
  return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR })
}

export function formatDateTime(date: Date | string | null | undefined) {
  if (!date) return '-'
  return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function generateOSNumber() {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 900000) + 100000
  return `OS-${year}-${random}`
}

export const STATUS_LABELS: Record<string, string> = {
  RECEBIDO: 'Recebido',
  EM_ANALISE: 'Em Análise',
  ORCAMENTO: 'Orçamento',
  ORCAMENTO_APROVADO: 'Orçamento Aprovado',
  AGUARDANDO_PECAS: 'Aguardando Peças',
  EM_MANUTENCAO: 'Em Manutenção',
  PRONTO: 'Pronto',
  FINALIZADO: 'Finalizado',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
}

export const STATUS_COLORS: Record<string, string> = {
  RECEBIDO: 'bg-blue-100 text-blue-800',
  EM_ANALISE: 'bg-yellow-100 text-yellow-800',
  ORCAMENTO: 'bg-orange-100 text-orange-800',
  ORCAMENTO_APROVADO: 'bg-purple-100 text-purple-800',
  AGUARDANDO_PECAS: 'bg-pink-100 text-pink-800',
  EM_MANUTENCAO: 'bg-indigo-100 text-indigo-800',
  PRONTO: 'bg-green-100 text-green-800',
  FINALIZADO: 'bg-teal-100 text-teal-800',
  ENTREGUE: 'bg-gray-100 text-gray-800',
  CANCELADO: 'bg-red-100 text-red-800',
}

export const TIPO_EQUIPAMENTO_LABELS: Record<string, string> = {
  notebook: 'Notebook',
  computador: 'Computador',
  impressora: 'Impressora',
  celular: 'Celular',
  outros: 'Outros',
}

export const FORMA_PAGAMENTO_LABELS: Record<string, string> = {
  dinheiro: 'Dinheiro',
  pix: 'PIX',
  cartao_debito: 'Cartão de Débito',
  cartao_credito: 'Cartão de Crédito',
  transferencia: 'Transferência',
}
