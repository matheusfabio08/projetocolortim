import { Edit2, Printer, Trash2 } from 'lucide-react'

interface ExistingPO {
  id: number; op_number: string; client: string; color: string
  order_number: string | null; description: string | null
  entry_date: string; expected_date: string; status: string; created_at: string
}

interface Props {
  filteredOPs: ExistingPO[]
  onEdit: (op: ExistingPO) => void
  onReprint: (op: ExistingPO) => void
  onDelete: (op: ExistingPO) => void
  fmt: (d: unknown, mask?: string) => string
  statusLabel: (s: string) => string
}

export function OPTable({ filteredOPs, onEdit, onReprint, onDelete, fmt, statusLabel }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {['OP', 'Cliente', 'Cor', 'Status', 'Previsão', 'Ações'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredOPs.length > 0 ? filteredOPs.map(op => (
              <tr key={op.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-blue-600">{op.op_number}</td>
                <td className="px-6 py-4">{op.client}</td>
                <td className="px-6 py-4">{op.color}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    {statusLabel(op.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{fmt(op.expected_date, 'dd/MM/yyyy')}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => onEdit(op)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => onReprint(op)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Printer className="w-4 h-4" /></button>
                    <button onClick={() => onDelete(op)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Nenhuma ficha encontrada</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
