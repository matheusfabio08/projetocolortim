import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

type ScrollItem = {
  id: number;
  op: string;
  produto: string;
  cliente: string;
  quantidade: number;
  status: string;
  createdAt: string;
};

export default function Scrolls() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery<ScrollItem[]>({
    queryKey: ['scrolls', search, statusFilter],
    queryFn: () =>
      api
        .get('/api/production-orders', {
          params: { search, status: statusFilter || undefined },
        })
        .then((r) => r.data),
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Scrolls / Ordens de Produção</h1>
        <p className="text-gray-500 text-sm mt-1">Visualização completa de todas as OPs do sistema</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar por OP, produto ou cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos os status</option>
          <option value="ABERTA">Aberta</option>
          <option value="EM_PRODUCAO">Em Produção</option>
          <option value="FINALIZADA">Finalizada</option>
          <option value="CANCELADA">Cancelada</option>
        </select>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
            Carregando...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['OP', 'Produto', 'Cliente', 'Quantidade', 'Status', 'Data'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data && data.length > 0 ? (
                  data.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold text-blue-700">{item.op}</td>
                      <td className="px-4 py-3 text-gray-700">{item.produto}</td>
                      <td className="px-4 py-3 text-gray-600">{item.cliente}</td>
                      <td className="px-4 py-3 text-gray-700">{item.quantidade.toLocaleString('pt-BR')}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                      Nenhuma OP encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ABERTA: 'bg-blue-100 text-blue-700',
    EM_PRODUCAO: 'bg-yellow-100 text-yellow-700',
    FINALIZADA: 'bg-green-100 text-green-700',
    CANCELADA: 'bg-red-100 text-red-700',
  };
  const labels: Record<string, string> = {
    ABERTA: 'Aberta',
    EM_PRODUCAO: 'Em Produção',
    FINALIZADA: 'Finalizada',
    CANCELADA: 'Cancelada',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {labels[status] ?? status}
    </span>
  );
}
