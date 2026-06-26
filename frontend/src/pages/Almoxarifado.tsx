import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Package, Search } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Layout from '@/components/Layout'
import { api } from '@/lib/api'

interface OPAlmox {
  id: string
  op_number: string
  client: string
  color: string
  material: string
  quantity_kg: number
  expected_date: string
  status: string
}

export default function Almoxarifado() {
  const [search, setSearch] = useState('')

  const { data: ops = [], isLoading } = useQuery<OPAlmox[]>({
    queryKey: ['almoxarifado-ops'],
    queryFn: () => api.get('/production-orders?status=almoxarifado').then(r => r.data),
  })

  const filtered = ops.filter(op =>
    op.op_number?.toLowerCase().includes(search.toLowerCase()) ||
    op.client?.toLowerCase().includes(search.toLowerCase()) ||
    op.material?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout>
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex-shrink-0 flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-600" /> Almoxarifado
            </h1>
            <p className="text-gray-600 text-sm">OPs aguardando material</p>
          </div>
        </div>

        <div className="flex-shrink-0 mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar por OP, cliente ou material..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-80" />
          </div>
        </div>

        <div className="flex-1 min-h-0 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {['OP','Cliente','Cor','Material','Qtd (kg)','Previsão'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.length > 0 ? filtered.map(op => (
                    <tr key={op.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-semibold text-blue-600">{op.op_number}</td>
                      <td className="px-3 py-2">{op.client}</td>
                      <td className="px-3 py-2">{op.color}</td>
                      <td className="px-3 py-2">{op.material ?? '-'}</td>
                      <td className="px-3 py-2 tabular-nums">{op.quantity_kg ?? '-'}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-500">
                        {format(new Date(op.expected_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6} className="px-3 py-8 text-center text-gray-500">Nenhuma OP no almoxarifado</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
