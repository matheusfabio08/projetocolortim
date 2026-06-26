import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Workflow, Plus } from 'lucide-react'
import Layout from '@/components/Layout'
import { api } from '@/lib/api'

export default function PreparacaoLote() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [selectedOps, setSelectedOps] = useState<string[]>([])
  const [form, setForm] = useState({ machine: '', temperature: '', time_minutes: '', observations: '' })

  const { data: ops = [] } = useQuery<{ id: string; op_number: string; client: string; color: string }[]>({
    queryKey: ['ops-select'],
    queryFn: () => api.get('/production-orders?status=preparacao').then(r => r.data),
  })

  const batchMutation = useMutation({
    mutationFn: (data: { op_ids: string[]; machine: string; temperature: string; time_minutes: string; observations: string }) =>
      api.post('/preparation/batch', data),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ['preparacao'] })
      toast.success(`${r.data.created} preparações criadas em lote!`)
      setShowModal(false)
      setSelectedOps([])
    },
    onError: () => toast.error('Erro ao criar lote'),
  })

  const toggleOp = (id: string) =>
    setSelectedOps(prev => prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id])

  return (
    <Layout>
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex-shrink-0 flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Workflow className="w-6 h-6 text-indigo-600" /> Preparação em Lote
            </h1>
            <p className="text-gray-600 text-sm">Lance múltiplas OPs de uma vez</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 bg-red-900 hover:bg-red-950 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" /><span>Novo Lote</span>
          </button>
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <Workflow className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">Preparação em Lote</p>
            <p className="text-sm mt-1">Clique em &quot;Novo Lote&quot; para lançar múltiplas OPs simultaneamente</p>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-xl font-bold text-gray-900">Preparação em Lote</h3>
              <p className="text-sm text-gray-500 mt-1">Selecione as OPs e configure os parâmetros</p>
            </div>
            <div className="flex-1 overflow-auto p-6 space-y-4">
              {/* OP selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">OPs para preparar ({selectedOps.length} selecionadas)</label>
                <div className="border border-gray-300 rounded-lg max-h-48 overflow-auto divide-y divide-gray-100">
                  {ops.length === 0 && <p className="px-3 py-4 text-center text-sm text-gray-400">Nenhuma OP disponível</p>}
                  {ops.map(op => (
                    <label key={op.id} className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" checked={selectedOps.includes(op.id)} onChange={() => toggleOp(op.id)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded" />
                      <span className="text-sm font-medium text-blue-600">{op.op_number}</span>
                      <span className="text-sm text-gray-600">{op.client}</span>
                      <span className="text-sm text-gray-500">/ {op.color}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Máquina *</label>
                  <input type="text" value={form.machine} onChange={e => setForm(f => ({...f, machine: e.target.value}))} required
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
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 flex-shrink-0">
              <button type="button" onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancelar</button>
              <button
                disabled={selectedOps.length === 0 || !form.machine || batchMutation.isPending}
                onClick={() => batchMutation.mutate({ op_ids: selectedOps, ...form })}
                className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50">
                {batchMutation.isPending ? 'Criando...' : `Criar ${selectedOps.length} preparações`}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
