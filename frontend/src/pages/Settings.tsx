import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Settings as SettingsIcon, Plus, Trash2 } from 'lucide-react'
import Layout from '@/components/Layout'
import { api } from '@/lib/api'

type Tab = 'fibras' | 'transportadoras' | 'regioes' | 'funcionarios'

interface Item { id: string; name: string; description?: string; code?: string; position?: string; department?: string }

const TABS: { key: Tab; label: string; endpoint: string; fields: { key: string; label: string; required?: boolean }[] }[] = [
  {
    key: 'fibras', label: 'Fibras', endpoint: '/fibras',
    fields: [{ key: 'name', label: 'Nome', required: true }, { key: 'code', label: 'Código' }, { key: 'description', label: 'Descrição' }]
  },
  {
    key: 'transportadoras', label: 'Transportadoras', endpoint: '/transportadoras',
    fields: [{ key: 'name', label: 'Nome', required: true }, { key: 'code', label: 'Código' }, { key: 'description', label: 'Observações' }]
  },
  {
    key: 'regioes', label: 'Regiões', endpoint: '/regioes',
    fields: [{ key: 'name', label: 'Nome', required: true }, { key: 'description', label: 'Descrição' }]
  },
  {
    key: 'funcionarios', label: 'Funcionários', endpoint: '/employees',
    fields: [{ key: 'name', label: 'Nome', required: true }, { key: 'position', label: 'Cargo' }, { key: 'department', label: 'Setor' }]
  },
]

export default function Settings() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState<Tab>('fibras')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})

  const tab = TABS.find(t => t.key === activeTab)!

  const { data: items = [], isLoading } = useQuery<Item[]>({
    queryKey: [activeTab],
    queryFn: () => api.get(tab.endpoint).then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: Record<string, string>) => api.post(tab.endpoint, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [activeTab] }); toast.success('Criado com sucesso!'); setShowModal(false) },
    onError: () => toast.error('Erro ao criar'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`${tab.endpoint}/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [activeTab] }); toast.success('Excluído!') },
    onError: () => toast.error('Erro ao excluir'),
  })

  const openCreate = () => {
    const empty: Record<string, string> = {}
    tab.fields.forEach(f => { empty[f.key] = '' })
    setForm(empty)
    setShowModal(true)
  }

  return (
    <Layout>
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex-shrink-0 mb-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-gray-600" /> Configurações
          </h1>
          <p className="text-gray-600 text-sm">Cadastros auxiliares do sistema</p>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 flex space-x-1 bg-gray-100 p-1 rounded-xl mb-4 w-fit">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === t.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-shrink-0 flex items-center justify-between mb-3">
          <p className="text-sm text-gray-500">{items.length} registro{items.length !== 1 ? 's' : ''}</p>
          <button onClick={openCreate} className="flex items-center space-x-2 bg-red-900 hover:bg-red-950 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm text-sm">
            <Plus className="w-4 h-4" /><span>Novo {tab.label.slice(0, -1)}</span>
          </button>
        </div>

        <div className="flex-1 min-h-0 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {tab.fields.map(f => (
                      <th key={f.key} className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">{f.label}</th>
                    ))}
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.length > 0 ? items.map((item: any) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      {tab.fields.map(f => (
                        <td key={f.key} className="px-3 py-2 text-gray-900">{item[f.key] || '-'}</td>
                      ))}
                      <td className="px-3 py-2">
                        <button onClick={() => { if (confirm('Excluir?')) deleteMutation.mutate(item.id) }}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={tab.fields.length + 1} className="px-3 py-8 text-center text-gray-500">Nenhum registro. Clique em &quot;Novo&quot; para adicionar.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200"><h3 className="text-xl font-bold text-gray-900">Novo {tab.label.slice(0,-1)}</h3></div>
            <form onSubmit={e => { e.preventDefault(); createMutation.mutate(form) }} className="p-6 space-y-4">
              {tab.fields.map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{f.label}{f.required ? ' *' : ''}</label>
                  <input type="text" value={form[f.key] ?? ''} onChange={e => setForm(prev => ({...prev, [f.key]: e.target.value}))} required={f.required}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm" />
                </div>
              ))}
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancelar</button>
                <button type="submit" disabled={createMutation.isPending}
                  className="px-6 py-2 text-sm font-medium text-white bg-red-900 hover:bg-red-950 rounded-lg disabled:opacity-50">
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
