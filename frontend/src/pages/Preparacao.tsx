import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Workflow, Plus, Search } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Layout from '@/components/Layout'
import { api } from '@/lib/api'

interface PrepEntry {
  id: string
  op_number: string
  client: string
  color: string
  machine: string
  quantity_kg: number
  temperature: number
  time_minutes: number
  status: string
  observations?: string
  created_at: string
  created_by_name?: string
}

export default function Preparacao() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    op_id: '', machine: '', quantity_kg: '',
    temperature: '', time_minutes: '', observations: ''
  })

  const { data: entries = [], isLoading } = useQuery<PrepEntry[]>({
    queryKey: ['preparacao'],
    queryFn: () => api.get('/preparation').then(r => r.data),
  })

  const { data: ops = [] } = useQuery<{ id: string; op_number: string; client: string; color: string }[]>({
    queryKey: ['ops-select'],
    queryFn: () => api.get('/production-orders?status=preparacao').then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/preparation', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['preparacao'] }); toast.success('Preparação registrada!'); setShowModal(false) },
    onError: () => toast.error('Erro ao registrar preparação'),
  })

  const filtered = entries.filter(e =>
    e.op_number?.toLowerCase().includes(search.toLowerCase()) ||
    e.client?.toLowerCase().includes(search.toLowerCase()) ||
    e.machine?.toLowerCase().includes(search.toLowerCase())
  )

  const statusMap: Record<string, { label: string; color: string }> = {
    pending:     { label: 'Pendente',    color: 'bg-yellow-100 text-yellow-700' },
    in_progress: { label: 'Em Andamento', color: 'bg-blue-100 text-blue-700' },
    completed:   { label: 'Concluído',   color: 'bg-green-100 text-green-700' },
  }

  return (
    <Layout>
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex-shrink-0 flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Workflow className="w-6 h-6 text-indigo-600" /> Preparação
            </h1>
            <p className="text-gray-600 text-sm">Lançamento de preparação de OPs</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 bg-red-900 hover:bg-red-950 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" /><span>Nova Preparação</span>
          </button>
        </div>

        <div className="flex-shrink-0 mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar por OP, cliente ou máquina..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full md:w-80" />
          </div>
        </div>

        <div className="flex-1 min-h-0 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {['OP','Cliente','Cor','Máquina','Qtd (kg)','Temp (°C)','Tempo (min)','Status','Data'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.length > 0 ? filtered.map(e => {
                    const s = statusMap[e.status] ?? { label: e.status, color: 'bg-gray-100 text-gray-700' }
                    return (
                      <tr key={e.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-semibold text-blue-600">{e.op_number}</td>
                        <td className="px-3 py-2">{e.client}</td>
                        <td className="px-3 py-2">{e.color}</td>
                        <td className="px-3 py-2">{e.machine}</td>
                        <td className="px-3 py-2 tabular-nums">{e.quantity_kg}</td>
                        <td className="px-3 py-2 tabular-nums">{e.temperature}</td>
                        <td className="px-3 py-2 tabular-nums">{e.time_minutes}</td>
                        <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.color}`}>{s.label}</span></td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-500">
                          {format(new Date(e.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </td>
                      </tr>
                    )
                  }) : (
                    <tr><td colSpan={9} className="px-3 py-8 text-center text-gray-500">Nenhuma preparação encontrada</td></tr>
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
              <h3 className="text-xl font-bold text-gray-900">Nova Preparação</h3>
            </div>
            <form onSubmit={e => { e.preventDefault(); createMutation.mutate(form) }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ordem de Produção *</label>
                <select value={form.op_id} onChange={e => setForm(f => ({...f, op_id: e.target.value}))} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm">
                  <option value="">Selecione uma OP...</option>
                  {ops.map(op => <option key={op.id} value={op.id}>{op.op_number} — {op.client} / {op.color}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Máquina *</label>
                  <input type="text" value={form.machine} onChange={e => setForm(f => ({...f, machine: e.target.value}))} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Qtd (kg) *</label>
                  <input type="number" step="0.01" value={form.quantity_kg} onChange={e => setForm(f => ({...f, quantity_kg: e.target.value}))} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Temperatura (°C)</label>
                  <input type="number" value={form.temperature} onChange={e => setForm(f => ({...f, temperature: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tempo (min)</label>
                  <input type="number" value={form.time_minutes} onChange={e => setForm(f => ({...f, time_minutes: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Observações</label>
                <textarea value={form.observations} onChange={e => setForm(f => ({...f, observations: e.target.value}))} rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm resize-none" />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancelar</button>
                <button type="submit" disabled={createMutation.isPending}
                  className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50">
                  {createMutation.isPending ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
