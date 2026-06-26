import { useQuery } from '@tanstack/react-query'
import { Kanban } from 'lucide-react'
import Layout from '@/components/Layout'
import { api } from '@/lib/api'

interface OPKanban {
  id: string
  op_number: string
  client: string
  color: string
  status: string
  expected_date: string
  quantity_kg?: number
}

const COLUMNS = [
  { key: 'almoxarifado',  label: 'Almoxarifado',  color: 'border-blue-400 bg-blue-50' },
  { key: 'laboratorio',   label: 'Laboratório',   color: 'border-purple-400 bg-purple-50' },
  { key: 'preparacao',    label: 'Preparação',    color: 'border-indigo-400 bg-indigo-50' },
  { key: 'producao',      label: 'Produção',      color: 'border-yellow-400 bg-yellow-50' },
  { key: 'secadora',      label: 'Secadora',      color: 'border-orange-400 bg-orange-50' },
  { key: 'destrinchagem', label: 'Destrinchagem', color: 'border-pink-400 bg-pink-50' },
  { key: 'enrolagem',     label: 'Enrolagem',     color: 'border-cyan-400 bg-cyan-50' },
  { key: 'qualidade',     label: 'Qualidade',     color: 'border-teal-400 bg-teal-50' },
  { key: 'concluido',     label: 'Concluído',     color: 'border-green-400 bg-green-50' },
]

export default function PCP() {
  const { data: ops = [], isLoading } = useQuery<OPKanban[]>({
    queryKey: ['pcp-ops'],
    queryFn: () => api.get('/production-orders').then(r => r.data),
  })

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.key] = ops.filter(op => op.status === col.key)
    return acc
  }, {} as Record<string, OPKanban[]>)

  return (
    <Layout>
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex-shrink-0 mb-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Kanban className="w-6 h-6 text-gray-600" /> PCP — Quadro Kanban
          </h1>
          <p className="text-gray-600 text-sm">Acompanhamento visual de todas as OPs</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto">
            <div className="flex space-x-3 h-full min-w-max pb-2">
              {COLUMNS.map(col => {
                const cards = grouped[col.key] ?? []
                return (
                  <div key={col.key} className={`flex-shrink-0 w-52 flex flex-col rounded-xl border-t-4 ${col.color} shadow-sm`}>
                    <div className="px-3 py-2 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-gray-700">{col.label}</span>
                        <span className="bg-white text-gray-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm border border-gray-200">{cards.length}</span>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                      {cards.length === 0 && (
                        <div className="text-center py-6 text-gray-400 text-xs">Nenhuma OP</div>
                      )}
                      {cards.map(op => (
                        <div key={op.id} className="bg-white rounded-lg p-2.5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                          <p className="font-bold text-blue-600 text-xs">{op.op_number}</p>
                          <p className="text-gray-700 text-xs mt-0.5 truncate">{op.client}</p>
                          <p className="text-gray-500 text-xs truncate">{op.color}</p>
                          {op.quantity_kg && (
                            <p className="text-gray-400 text-xs mt-1">{op.quantity_kg} kg</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
