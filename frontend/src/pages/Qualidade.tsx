import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CheckCircle, Plus, Search, ThumbsUp, ThumbsDown } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Layout from '@/components/Layout'
import { api } from '@/lib/api'

interface QualityEntry {
  id: string
  op_number: string
  client: string
  color: string
  inspector: string
  approved: boolean
  defects?: string
  observations?: string
  quantity_kg: number
  created_at: string
  created_by_name?: string
}

const DEFECT_OPTIONS = [
  'Cor divergente', 'Manchas', 'Furos', 'Fios soltos', 'Encolhimento',
  'Toque inadequado', 'Irregularidade no tingimento', 'Outros'
]

export default function Qualidade() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'approved' | 'rejected'>('all')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    op_id: '', inspector: '', approved: true,
    defects: [] as string[], quantity_kg: '', observations: ''
  })

  const { data: entries = [], isLoading } = useQuery<QualityEntry[]>({
    queryKey: ['quality'],
    queryFn: () => api.get('/quality').then(r => r.data),
  })

  const { data: ops = [] } = useQuery<{ id: string; op_number: string; client: string; color: string }[]>({
    queryKey: ['ops-select'],
    queryFn: () => api.get('/production-orders').then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/quality', { ...data, defects: data.defects.join(', ') }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['quality'] }); toast.success('Inspecção registrada!'); setShowModal(false) },
    onError: () => toast.error('Erro ao registrar'),
  })

  const toggleDefect = (d: string) =>
    setForm(f => ({ ...f, defects: f.defects.includes(d) ? f.defects.filter(x => x !== d) : [...f.defects, d] }))

  const filtered = entries.filter(e => {
    const matchSearch = e.op_number?.toLowerCase().includes(search.toLowerCase()) || e.client?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || (filter === 'approved' && e.approved) || (filter === 'rejected' && !e.approved)
    return matchSearch && matchFilter
  })

  const total     = entries.length
  const approved  = entries.filter(e => e.approved).length
  const rejected  = entries.filter(e => !e.approved).length
  const rate      = total > 0 ? Math.round((approved / total) * 100) : 0

  return (
    <Layout>
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex-shrink-0 flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-teal-600" /> Qualidade
            </h1>
            <p className="text-gray-600 text-sm">Inspecção e controle de qualidade</p>
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center space-x-2 bg-red-900 hover:bg-red-950 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" /><span>Nova Inspecção</span>
          </button>
        </div>

        {/* KPIs */}
        <div className="flex-shrink-0 grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          {[{ label: 'Total', value: total, color: 'bg-gray-50 border-gray-200 text-gray-700' },
            { label: 'Aprovadas', value: approved, color: 'bg-green-50 border-green-200 text-green-700' },
            { label: 'Reprovadas', value: rejected, color: 'bg-red-50 border-red-200 text-red-700' },
            { label: 'Taxa Aprovado', value: `${rate}%`, color: 'bg-teal-50 border-teal-200 text-teal-700' },
          ].map(k => (
            <div key={k.label} className={`rounded-xl border p-3 ${k.color}`}>
              <p className="text-xs font-medium opacity-75">{k.label}</p>
              <p className="text-2xl font-bold mt-0.5">{k.value}</p>
            </div>
          ))}
        </div>

        <div className="flex-shrink-0 flex flex-col md:flex-row gap-3 mb-3">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar por OP ou cliente..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 w-full" />
          </div>
          <div className="flex space-x-1">
            {(['all', 'approved', 'rejected'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filter === f ? 'bg-red-900 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                }`}>
                {f === 'all' ? 'Todos' : f === 'approved' ? 'Aprovados' : 'Reprovados'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-0 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>{['OP','Cliente','Cor','Inspetor','Qtd (kg)','Resultado','Defeitos','Data'].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.length > 0 ? filtered.map(e => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-semibold text-blue-600">{e.op_number}</td>
                      <td className="px-3 py-2">{e.client}</td>
                      <td className="px-3 py-2">{e.color}</td>
                      <td className="px-3 py-2">{e.inspector}</td>
                      <td className="px-3 py-2 tabular-nums">{e.quantity_kg}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          e.approved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {e.approved ? <ThumbsUp className="w-3 h-3" /> : <ThumbsDown className="w-3 h-3" />}
                          {e.approved ? 'Aprovado' : 'Reprovado'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-500 max-w-xs truncate">{e.defects || '-'}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-500">
                        {format(new Date(e.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </td>
                    </tr>
                  )) : <tr><td colSpan={8} className="px-3 py-8 text-center text-gray-500">Nenhuma inspecção encontrada</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0"><h3 className="text-xl font-bold text-gray-900">Nova Inspecção de Qualidade</h3></div>
            <div className="flex-1 overflow-auto">
              <form id="quality-form" onSubmit={e => { e.preventDefault(); createMutation.mutate(form) }} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">OP *</label>
                  <select value={form.op_id} onChange={e => setForm(f => ({...f, op_id: e.target.value}))} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm">
                    <option value="">Selecione...</option>
                    {ops.map(op => <option key={op.id} value={op.id}>{op.op_number} — {op.client} / {op.color}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Inspetor *</label>
                    <input type="text" value={form.inspector} onChange={e => setForm(f => ({...f, inspector: e.target.value}))} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Qtd inspecionada (kg) *</label>
                    <input type="number" step="0.01" value={form.quantity_kg} onChange={e => setForm(f => ({...f, quantity_kg: e.target.value}))} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Resultado</label>
                  <div className="flex space-x-3">
                    {([true, false] as const).map(val => (
                      <button key={String(val)} type="button" onClick={() => setForm(f => ({...f, approved: val}))}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border-2 font-medium text-sm transition-colors ${
                          form.approved === val
                            ? val ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}>
                        {val ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}
                        {val ? 'Aprovado' : 'Reprovado'}
                      </button>
                    ))}
                  </div>
                </div>
                {!form.approved && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Defeitos encontrados</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {DEFECT_OPTIONS.map(d => (
                        <label key={d} className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" checked={form.defects.includes(d)} onChange={() => toggleDefect(d)}
                            className="w-4 h-4 text-red-600 border-gray-300 rounded" />
                          <span className="text-sm text-gray-700">{d}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Observações</label>
                  <textarea value={form.observations} onChange={e => setForm(f => ({...f, observations: e.target.value}))} rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm resize-none" />
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-gray-200 flex-shrink-0 flex justify-end space-x-3">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancelar</button>
              <button form="quality-form" type="submit" disabled={createMutation.isPending}
                className="px-6 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg disabled:opacity-50">
                {createMutation.isPending ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
