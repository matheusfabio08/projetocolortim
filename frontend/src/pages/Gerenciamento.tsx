import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Search, Pencil, Trash2, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Layout from '@/components/Layout'
import { api } from '@/lib/api'

interface OP {
  id: string
  op_number: string
  client: string
  color: string
  status: string
  expected_date: string
  quantity_kg?: number
  material?: string
  created_at: string
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  almoxarifado:  { label: 'Almoxarifado',  color: 'bg-blue-100 text-blue-700' },
  laboratorio:   { label: 'Laboratório',   color: 'bg-purple-100 text-purple-700' },
  preparacao:    { label: 'Preparação',    color: 'bg-indigo-100 text-indigo-700' },
  producao:      { label: 'Produção',      color: 'bg-yellow-100 text-yellow-700' },
  secadora:      { label: 'Secadora',      color: 'bg-orange-100 text-orange-700' },
  destrinchagem: { label: 'Destrinchagem', color: 'bg-pink-100 text-pink-700' },
  enrolagem:     { label: 'Enrolagem',     color: 'bg-cyan-100 text-cyan-700' },
  qualidade:     { label: 'Qualidade',     color: 'bg-teal-100 text-teal-700' },
  concluido:     { label: 'Concluído',     color: 'bg-green-100 text-green-700' },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { label: status, color: 'bg-gray-100 text-gray-700' }
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${s.color}`}>{s.label}</span>
}

export default function Gerenciamento() {
  const qc = useQueryClient()
  const [search, setSearch]       = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState<OP | null>(null)
  const [form, setForm] = useState({
    op_number: '', client: '', color: '', material: '',
    quantity_kg: '', expected_date: '', status: 'almoxarifado',
  })

  const { data: ops = [], isLoading } = useQuery<OP[]>({
    queryKey: ['ops'],
    queryFn: () => api.get('/production-orders').then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/production-orders', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ops'] }); toast.success('OP criada!'); closeModal() },
    onError:   () => toast.error('Erro ao criar OP'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof form }) => api.put(`/production-orders/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ops'] }); toast.success('OP atualizada!'); closeModal() },
    onError:   () => toast.error('Erro ao atualizar OP'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/production-orders/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ops'] }); toast.success('OP excluída!') },
    onError:   () => toast.error('Erro ao excluir OP'),
  })

  const openCreate = () => {
    setEditing(null)
    setForm({ op_number: '', client: '', color: '', material: '', quantity_kg: '', expected_date: '', status: 'almoxarifado' })
    setShowModal(true)
  }

  const openEdit = (op: OP) => {
    setEditing(op)
    setForm({
      op_number: op.op_number, client: op.client, color: op.color,
      material: op.material ?? '', quantity_kg: String(op.quantity_kg ?? ''),
      expected_date: op.expected_date?.split('T')[0] ?? '', status: op.status,
    })
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setEditing(null) }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) updateMutation.mutate({ id: editing.id, data: form })
    else createMutation.mutate(form)
  }

  const filtered = ops.filter(op =>
    op.op_number.toLowerCase().includes(search.toLowerCase()) ||
    op.client.toLowerCase().includes(search.toLowerCase()) ||
    op.color.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout>
      <div className="h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciamento</h1>
            <p className="text-gray-600 text-sm">Ordens de produção</p>
          </div>
          <button onClick={openCreate} className="flex items-center space-x-2 bg-red-900 hover:bg-red-950 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            <span>Nova OP</span>
          </button>
        </div>

        {/* Search */}
        <div className="flex-shrink-0 mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" placeholder="Buscar por OP, cliente ou cor..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent w-full md:w-80"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 min-h-0 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-8 h-8 border-4 border-red-900 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {['OP','Material','Cliente','Cor','Qtd (kg)','Status','Previsão','Ações'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.length > 0 ? filtered.map(op => (
                    <tr key={op.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 font-semibold text-blue-600 whitespace-nowrap">{op.op_number}</td>
                      <td className="px-3 py-2 text-gray-900">{op.material ?? '-'}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-900">{op.client}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-900">{op.color}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-900">{op.quantity_kg ?? '-'}</td>
                      <td className="px-3 py-2 whitespace-nowrap"><StatusBadge status={op.status} /></td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-600">
                        {format(new Date(op.expected_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <button onClick={() => openEdit(op)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => { if (confirm('Excluir esta OP?')) deleteMutation.mutate(op.id) }}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={8} className="px-3 py-8 text-center text-gray-500">Nenhuma OP encontrada</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">{editing ? 'Editar OP' : 'Nova Ordem de Produção'}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nº OP *</label>
                  <input type="text" value={form.op_number} onChange={e => setForm(f => ({...f, op_number: e.target.value}))} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Cliente *</label>
                  <input type="text" value={form.client} onChange={e => setForm(f => ({...f, client: e.target.value}))} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Cor *</label>
                  <input type="text" value={form.color} onChange={e => setForm(f => ({...f, color: e.target.value}))} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Material</label>
                  <input type="text" value={form.material} onChange={e => setForm(f => ({...f, material: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Qtd (kg)</label>
                  <input type="number" step="0.01" value={form.quantity_kg} onChange={e => setForm(f => ({...f, quantity_kg: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Previsão *</label>
                  <input type="date" value={form.expected_date} onChange={e => setForm(f => ({...f, expected_date: e.target.value}))} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm">
                  {Object.entries(STATUS_MAP).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-6 py-2 text-sm font-medium text-white bg-red-900 hover:bg-red-950 rounded-lg transition-colors disabled:opacity-50">
                  {editing ? 'Salvar' : 'Criar OP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
