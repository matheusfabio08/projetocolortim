import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Truck, Plus, Search } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Layout from '@/components/Layout'
import { api } from '@/lib/api'

interface OutputEntry {
  id: string
  op_number: string
  client: string
  color: string
  carrier: string
  region: string
  invoice_number: string
  quantity_kg: number
  boxes: number
  shipped_at: string
  created_at: string
  created_by_name?: string
}

export default function ListaSaida() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    op_id: '', carrier: '', region: '',
    invoice_number: '', quantity_kg: '', boxes: '', shipped_at: '', observations: ''
  })

  const { data: entries = [], isLoading } = useQuery<OutputEntry[]>({
    queryKey: ['lista-saida'],
    queryFn: () => api.get('/lista-saida').then(r => r.data),
  })

  const { data: ops = [] } = useQuery<{ id: string; op_number: string; client: string; color: string }[]>({
    queryKey: ['ops-select'],
    queryFn: () => api.get('/production-orders?status=concluido').then(r => r.data),
  })

  const { data: carriers = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: ['transportadoras'],
    queryFn: () => api.get('/transportadoras').then(r => r.data),
  })

  const { data: regions = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: ['regioes'],
    queryFn: () => api.get('/regioes').then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/lista-saida', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lista-saida'] }); toast.success('Saída registrada!'); setShowModal(false) },
    onError: () => toast.error('Erro ao registrar saída'),
  })

  const filtered = entries.filter(e =>
    e.op_number?.toLowerCase().includes(search.toLowerCase()) ||
    e.client?.toLowerCase().includes(search.toLowerCase()) ||
    e.carrier?.toLowerCase().includes(search.toLowerCase()) ||
    e.invoice_number?.toLowerCase().includes(search.toLowerCase())
  )

  const totalKg    = filtered.reduce((s, e) => s + (e.quantity_kg || 0), 0)
  const totalBoxes = filtered.reduce((s, e) => s + (e.boxes || 0), 0)

  function getEntryDate(e: OutputEntry): Date {
    const raw = e.shipped_at || e.created_at
    return raw ? new Date(raw) : new Date()
  }

  return (
    <Layout>
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex-shrink-0 flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Truck className="w-6 h-6 text-blue-600" /> Lista de Saída
            </h1>
            <p className="text-gray-600 text-sm">Controle de expedição e transporte</p>
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center space-x-2 bg-red-900 hover:bg-red-950 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" /><span>Registrar Saída</span>
          </button>
        </div>

        {/* Totais */}
        <div className="flex-shrink-0 grid grid-cols-2 gap-3 mb-3">
          <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
            <p className="text-xs text-gray-500">Total kg (filtrado)</p>
            <p className="text-xl font-bold text-blue-700 tabular-nums">{totalKg.toFixed(3)} kg</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
            <p className="text-xs text-gray-500">Total caixas (filtrado)</p>
            <p className="text-xl font-bold text-gray-700 tabular-nums">{totalBoxes}</p>
          </div>
        </div>

        <div className="flex-shrink-0 mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar por OP, cliente, transportadora ou NF..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full md:w-96" />
          </div>
        </div>

        <div className="flex-1 min-h-0 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>{['OP','Cliente','Cor','NF','Transportadora','Região','Qtd (kg)','Caixas','Data'].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.length > 0 ? filtered.map(e => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-semibold text-blue-600">{e.op_number}</td>
                      <td className="px-3 py-2">{e.client}</td>
                      <td className="px-3 py-2">{e.color}</td>
                      <td className="px-3 py-2 font-mono text-xs">{e.invoice_number}</td>
                      <td className="px-3 py-2">{e.carrier}</td>
                      <td className="px-3 py-2">{e.region}</td>
                      <td className="px-3 py-2 tabular-nums font-medium">{e.quantity_kg?.toFixed(3)}</td>
                      <td className="px-3 py-2 tabular-nums">{e.boxes}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-500">
                        {format(getEntryDate(e), 'dd/MM/yyyy', { locale: ptBR })}
                      </td>
                    </tr>
                  )) : <tr><td colSpan={9} className="px-3 py-8 text-center text-gray-500">Nenhuma saída registrada</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0"><h3 className="text-xl font-bold text-gray-900">Registrar Saída</h3></div>
            <form id="saida-form" onSubmit={e => { e.preventDefault(); createMutation.mutate(form) }} className="flex-1 overflow-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">OP *</label>
                <select value={form.op_id} onChange={e => setForm(f => ({...f, op_id: e.target.value}))} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                  <option value="">Selecione...</option>
                  {ops.map(op => <option key={op.id} value={op.id}>{op.op_number} — {op.client} / {op.color}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Transportadora *</label>
                  <select value={form.carrier} onChange={e => setForm(f => ({...f, carrier: e.target.value}))} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="">Selecione...</option>
                    {carriers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    <option value="__other">Outra</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Região *</label>
                  <select value={form.region} onChange={e => setForm(f => ({...f, region: e.target.value}))} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="">Selecione...</option>
                    {regions.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                    <option value="__other">Outra</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Número NF</label>
                  <input type="text" value={form.invoice_number} onChange={e => setForm(f => ({...f, invoice_number: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Data de Saída</label>
                  <input type="date" value={form.shipped_at} onChange={e => setForm(f => ({...f, shipped_at: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Qtd (kg) *</label>
                  <input type="number" step="0.001" value={form.quantity_kg} onChange={e => setForm(f => ({...f, quantity_kg: e.target.value}))} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Caixas</label>
                  <input type="number" min="1" value={form.boxes} onChange={e => setForm(f => ({...f, boxes: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Observações</label>
                <textarea value={form.observations} onChange={e => setForm(f => ({...f, observations: e.target.value}))} rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
              </div>
            </form>
            <div className="p-6 border-t border-gray-200 flex-shrink-0 flex justify-end space-x-3">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancelar</button>
              <button form="saida-form" type="submit" disabled={createMutation.isPending}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">
                {createMutation.isPending ? 'Salvando...' : 'Registrar Saída'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
