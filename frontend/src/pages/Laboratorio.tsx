import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { FlaskConical, Plus, Search } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Layout from '@/components/Layout'
import { api } from '@/lib/api'

interface LabEntry {
  id: string
  op_number: string
  client: string
  color: string
  fiber: string
  recipe: string
  result: string
  approved: boolean
  observations?: string
  created_at: string
  created_by_name?: string
}

export default function Laboratorio() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    op_id: '', fiber: '', recipe: '', result: '',
    approved: true, observations: '',
  })

  const { data: entries = [], isLoading } = useQuery<LabEntry[]>({
    queryKey: ['lab'],
    queryFn: () => api.get('/laboratory').then(r => r.data),
  })

  const { data: ops = [] } = useQuery<{ id: string; op_number: string; client: string; color: string }[]>({
    queryKey: ['ops-select'],
    queryFn: () => api.get('/production-orders?status=laboratorio').then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/laboratory', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lab'] }); toast.success('Laudo registrado!'); setShowModal(false) },
    onError: () => toast.error('Erro ao registrar laudo'),
  })

  const filtered = entries.filter(e =>
    e.op_number?.toLowerCase().includes(search.toLowerCase()) ||
    e.client?.toLowerCase().includes(search.toLowerCase()) ||
    e.color?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout>
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex-shrink-0 flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FlaskConical className="w-6 h-6 text-purple-600" /> Laboratório
            </h1>
            <p className="text-gray-600 text-sm">Laudos e receitas de tingimento</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 bg-red-900 hover:bg-red-950 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" /><span>Novo Laudo</span>
          </button>
        </div>

        <div className="flex-shrink-0 mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar por OP, cliente ou cor..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full md:w-80" />
          </div>
        </div>

        <div className="flex-1 min-h-0 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {['OP','Cliente','Cor','Fibra','Receita','Resultado','Aprovado','Data','Responsável'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.length > 0 ? filtered.map(e => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-semibold text-blue-600">{e.op_number}</td>
                      <td className="px-3 py-2">{e.client}</td>
                      <td className="px-3 py-2">{e.color}</td>
                      <td className="px-3 py-2">{e.fiber}</td>
                      <td className="px-3 py-2 max-w-xs truncate">{e.recipe}</td>
                      <td className="px-3 py-2">{e.result}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          e.approved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>{e.approved ? 'Aprovado' : 'Reprovado'}</span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-500">
                        {format(new Date(e.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </td>
                      <td className="px-3 py-2 text-gray-500">{e.created_by_name}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={9} className="px-3 py-8 text-center text-gray-500">Nenhum laudo encontrado</td></tr>
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
              <h3 className="text-xl font-bold text-gray-900">Novo Laudo de Laboratório</h3>
            </div>
            <form onSubmit={e => { e.preventDefault(); createMutation.mutate(form) }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ordem de Produção *</label>
                <select value={form.op_id} onChange={e => setForm(f => ({...f, op_id: e.target.value}))} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm">
                  <option value="">Selecione uma OP...</option>
                  {ops.map(op => (
                    <option key={op.id} value={op.id}>{op.op_number} — {op.client} / {op.color}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Fibra *</label>
                  <input type="text" value={form.fiber} onChange={e => setForm(f => ({...f, fiber: e.target.value}))} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Resultado *</label>
                  <input type="text" value={form.result} onChange={e => setForm(f => ({...f, result: e.target.value}))} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Receita *</label>
                <textarea value={form.recipe} onChange={e => setForm(f => ({...f, recipe: e.target.value}))} required rows={3}
                  placeholder="Descreva a receita de tingimento..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Observações</label>
                <textarea value={form.observations} onChange={e => setForm(f => ({...f, observations: e.target.value}))} rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm resize-none" />
              </div>
              <div className="flex items-center space-x-3">
                <input type="checkbox" id="approved" checked={form.approved}
                  onChange={e => setForm(f => ({...f, approved: e.target.checked}))}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                <label htmlFor="approved" className="text-sm font-medium text-gray-700">Aprovado</label>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancelar</button>
                <button type="submit" disabled={createMutation.isPending}
                  className="px-6 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50">
                  {createMutation.isPending ? 'Salvando...' : 'Salvar Laudo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
