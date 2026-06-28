import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CheckCircle, Plus, Search } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Layout from '@/components/Layout'
import { api } from '@/lib/api'

interface FabricEntry {
  id: string
  op_number: string
  client: string
  color: string
  fabric_type: string
  width_cm: number
  weight_gsm: number
  shrinkage_pct: number
  approved: boolean
  observations?: string
  created_at: string
  created_by_name?: string
}

export default function FabricQuality() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    op_id: '', fabric_type: '', width_cm: '',
    weight_gsm: '', shrinkage_pct: '', approved: true, observations: ''
  })

  const { data: entries = [], isLoading } = useQuery<FabricEntry[]>({
    queryKey: ['fabric-quality'],
    queryFn: () => api.get('/fabric-quality').then(r => r.data),
  })

  const { data: ops = [] } = useQuery<{ id: string; op_number: string; client: string; color: string }[]>({
    queryKey: ['ops-select'],
    queryFn: () => api.get('/production-orders').then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/fabric-quality', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fabric-quality'] }); toast.success('Qualidade de malha registrada!'); setShowModal(false) },
    onError: () => toast.error('Erro ao registrar'),
  })

  const filtered = entries.filter(e =>
    e.op_number?.toLowerCase().includes(search.toLowerCase()) ||
    e.client?.toLowerCase().includes(search.toLowerCase()) ||
    e.fabric_type?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout>
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex-shrink-0 flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-emerald-600" /> Qualidade de Malhas
            </h1>
            <p className="text-gray-600 text-sm">Análise técnica das malhas por OP</p>
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center space-x-2 bg-red-900 hover:bg-red-950 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" /><span>Nova Análise</span>
          </button>
        </div>

        <div className="flex-shrink-0 mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar por OP, cliente ou tipo de malha..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 w-full md:w-80" />
          </div>
        </div>

        <div className="flex-1 min-h-0 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>{['OP','Cliente','Cor','Tipo de Malha','Largura (cm)','Gramatura (g/m²)','Encolhimento (%)','Status','Data'].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.length > 0 ? filtered.map(e => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-semibold text-blue-600">{e.op_number}</td>
                      <td className="px-3 py-2">{e.client}</td>
                      <td className="px-3 py-2">{e.color}</td>
                      <td className="px-3 py-2">{e.fabric_type}</td>
                      <td className="px-3 py-2 tabular-nums">{e.width_cm}</td>
                      <td className="px-3 py-2 tabular-nums">{e.weight_gsm}</td>
                      <td className="px-3 py-2 tabular-nums">{e.shrinkage_pct}%</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          e.approved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>{e.approved ? 'Aprovado' : 'Reprovado'}</span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-500">
                        {format(new Date(e.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </td>
                    </tr>
                  )) : <tr><td colSpan={9} className="px-3 py-8 text-center text-gray-500">Nenhuma análise encontrada</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-200"><h3 className="text-xl font-bold text-gray-900">Nova Análise de Malha</h3></div>
            <form onSubmit={e => { e.preventDefault(); createMutation.mutate(form) }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">OP *</label>
                <select value={form.op_id} onChange={e => setForm(f => ({...f, op_id: e.target.value}))} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm">
                  <option value="">Selecione...</option>
                  {ops.map(op => <option key={op.id} value={op.id}>{op.op_number} — {op.client} / {op.color}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Malha *</label>
                <input type="text" value={form.fabric_type} onChange={e => setForm(f => ({...f, fabric_type: e.target.value}))} required
                  placeholder="Ex: Malha Fina, Jersey, Ribana..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[['Largura (cm)','width_cm'],['Gramatura (g/m²)','weight_gsm'],['Encolhimento (%)','shrinkage_pct']].map(([label, key]) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
                    <input type="number" step="0.1" value={(form as any)[key]} onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm" />
                  </div>
                ))}
              </div>
              <div className="flex items-center space-x-3">
                <input type="checkbox" id="fab-approved" checked={form.approved}
                  onChange={e => setForm(f => ({...f, approved: e.target.checked}))}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded" />
                <label htmlFor="fab-approved" className="text-sm font-medium text-gray-700">Aprovado</label>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Observações</label>
                <textarea value={form.observations} onChange={e => setForm(f => ({...f, observations: e.target.value}))} rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm resize-none" />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancelar</button>
                <button type="submit" disabled={createMutation.isPending}
                  className="px-6 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50">
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
