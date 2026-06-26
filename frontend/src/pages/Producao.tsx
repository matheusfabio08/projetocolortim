import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Factory, Plus, Search, CheckCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Layout from '@/components/Layout'
import { api } from '@/lib/api'

interface ProdEntry {
  id: string
  op_number: string
  client: string
  color: string
  box_number: number
  machine: string
  quantity_kg: number
  status: string
  started_at?: string
  finished_at?: string
  created_by_name?: string
}

export default function Producao() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [boxFilter, setBoxFilter] = useState<number | 'all'>('all')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    op_id: '', box_number: '1', machine: '', quantity_kg: '', observations: ''
  })

  const { data: entries = [], isLoading } = useQuery<ProdEntry[]>({
    queryKey: ['producao'],
    queryFn: () => api.get('/production').then(r => r.data),
  })

  const { data: ops = [] } = useQuery<{ id: string; op_number: string; client: string; color: string }[]>({
    queryKey: ['ops-select'],
    queryFn: () => api.get('/production-orders').then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/production', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['producao'] }); toast.success('Lançado na produção!'); setShowModal(false) },
    onError: () => toast.error('Erro ao lançar produção'),
  })

  const finishMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/production/${id}/finish`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['producao'] }); toast.success('Produção finalizada!') },
    onError: () => toast.error('Erro ao finalizar'),
  })

  const filtered = entries.filter(e => {
    const matchBox = boxFilter === 'all' || e.box_number === boxFilter
    const matchSearch = e.op_number?.toLowerCase().includes(search.toLowerCase()) ||
      e.client?.toLowerCase().includes(search.toLowerCase())
    return matchBox && matchSearch
  })

  const statusMap: Record<string, { label: string; color: string }> = {
    in_progress: { label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-700' },
    completed:   { label: 'Concluído',    color: 'bg-green-100 text-green-700' },
    paused:      { label: 'Pausado',      color: 'bg-gray-100 text-gray-700' },
  }

  return (
    <Layout>
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex-shrink-0 flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Factory className="w-6 h-6 text-yellow-600" /> Produção — Box 1, 2, 3
            </h1>
            <p className="text-gray-600 text-sm">Controle de produção por box</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 bg-red-900 hover:bg-red-950 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" /><span>Lançar Produção</span>
          </button>
        </div>

        <div className="flex-shrink-0 flex flex-col md:flex-row gap-3 mb-3">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar OP ou cliente..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent w-full" />
          </div>
          <div className="flex space-x-1">
            {(['all', 1, 2, 3] as const).map(b => (
              <button key={b} onClick={() => setBoxFilter(b)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  boxFilter === b
                    ? 'bg-red-900 text-white'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                }`}>
                {b === 'all' ? 'Todos' : `Box ${b}`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-0 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {['Box','OP','Cliente','Cor','Máquina','Qtd (kg)','Status','Início','Ações'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.length > 0 ? filtered.map(e => {
                    const s = statusMap[e.status] ?? { label: e.status, color: 'bg-gray-100 text-gray-700' }
                    return (
                      <tr key={e.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-bold">Box {e.box_number}</span>
                        </td>
                        <td className="px-3 py-2 font-semibold text-blue-600">{e.op_number}</td>
                        <td className="px-3 py-2">{e.client}</td>
                        <td className="px-3 py-2">{e.color}</td>
                        <td className="px-3 py-2">{e.machine}</td>
                        <td className="px-3 py-2 tabular-nums">{e.quantity_kg}</td>
                        <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.color}`}>{s.label}</span></td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-500">
                          {e.started_at ? format(new Date(e.started_at), 'dd/MM HH:mm', { locale: ptBR }) : '-'}
                        </td>
                        <td className="px-3 py-2">
                          {e.status === 'in_progress' && (
                            <button onClick={() => finishMutation.mutate(e.id)}
                              className="flex items-center space-x-1 px-2 py-1 text-xs text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                              <CheckCircle className="w-3 h-3" /><span>Finalizar</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  }) : (
                    <tr><td colSpan={9} className="px-3 py-8 text-center text-gray-500">Nenhum registro encontrado</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Lançar na Produção</h3>
            </div>
            <form onSubmit={e => { e.preventDefault(); createMutation.mutate(form) }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ordem de Produção *</label>
                <select value={form.op_id} onChange={e => setForm(f => ({...f, op_id: e.target.value}))} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 text-sm">
                  <option value="">Selecione uma OP...</option>
                  {ops.map(op => <option key={op.id} value={op.id}>{op.op_number} — {op.client} / {op.color}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Box *</label>
                  <select value={form.box_number} onChange={e => setForm(f => ({...f, box_number: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 text-sm">
                    <option value="1">Box 1</option>
                    <option value="2">Box 2</option>
                    <option value="3">Box 3</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Máquina *</label>
                  <input type="text" value={form.machine} onChange={e => setForm(f => ({...f, machine: e.target.value}))} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Quantidade (kg) *</label>
                <input type="number" step="0.01" value={form.quantity_kg} onChange={e => setForm(f => ({...f, quantity_kg: e.target.value}))} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Observações</label>
                <textarea value={form.observations} onChange={e => setForm(f => ({...f, observations: e.target.value}))} rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 text-sm resize-none" />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancelar</button>
                <button type="submit" disabled={createMutation.isPending}
                  className="px-6 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-lg disabled:opacity-50">
                  {createMutation.isPending ? 'Lançando...' : 'Lançar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
