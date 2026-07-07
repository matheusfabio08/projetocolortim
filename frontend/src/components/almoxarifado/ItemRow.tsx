import { Trash2 } from 'lucide-react'

interface Fibra { id: number; name: string }
interface Item {
  id?: number; material: string; quantity: string
  unit: 'metros' | 'unidades' | 'kg'
  requiresLab: boolean; requiresFabricQuality: boolean
  selectedFibers: number[]; tempId: string
}

interface Props {
  item: Item
  index: number
  fibras: Fibra[]
  editingOP: number | null
  existingOPNumber?: string
  getItemOP: (i: number) => string
  updateItem: (tempId: string, field: keyof Item, value: unknown) => void
  removeItem: (tempId: string) => void
  totalItems: number
}

export function ItemRow({ item, index, fibras, editingOP, existingOPNumber, getItemOP, updateItem, removeItem, totalItems }: Props) {
  return (
    <div className="p-4 border-2 border-gray-200 rounded-xl bg-gray-50">
      <div className="grid grid-cols-12 gap-3 mb-3">
        <div className="col-span-5">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Material *</label>
          <input
            type="text" value={item.material}
            onChange={e => updateItem(item.tempId, 'material', e.target.value.toUpperCase())}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase"
            placeholder="Ex: ELÁSTICO 10-20MM" required
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Qtd *</label>
          <input
            type="number" step="0.01" value={item.quantity}
            onChange={e => updateItem(item.tempId, 'quantity', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="100" required
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Un *</label>
          <select
            value={item.unit}
            onChange={e => updateItem(item.tempId, 'unit', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="metros">m</option>
            <option value="unidades">un</option>
            <option value="kg">kg</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1">OP</label>
          <div className="px-2 py-2 border border-gray-200 rounded-lg bg-blue-50 text-sm text-blue-700 font-semibold text-center">
            {editingOP ? (existingOPNumber || '') : getItemOP(index)}
          </div>
        </div>
        <div className="col-span-1 flex items-end">
          <button
            type="button" onClick={() => removeItem(item.tempId)}
            disabled={totalItems === 1}
            className="w-full p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-200">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox" checked={item.requiresLab}
            onChange={e => updateItem(item.tempId, 'requiresLab', e.target.checked)}
            className="w-4 h-4 text-purple-600 rounded"
          />
          <span className="text-xs font-semibold text-purple-700">Laboratório</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox" checked={item.requiresFabricQuality}
            onChange={e => updateItem(item.tempId, 'requiresFabricQuality', e.target.checked)}
            className="w-4 h-4 text-teal-600 rounded"
          />
          <span className="text-xs font-semibold text-teal-700">Qualidade de Malha</span>
        </label>
        <div className="h-4 w-px bg-gray-300" />
        <span className="text-xs font-semibold text-gray-500">Fibras (máx 2):</span>
        {fibras.length === 0 ? (
          <span className="text-xs text-gray-400 italic">Carregando...</span>
        ) : fibras.map(fibra => {
          const sel = item.selectedFibers.includes(fibra.id)
          const dis = !sel && item.selectedFibers.length >= 2
          return (
            <label key={fibra.id} className={`flex items-center gap-1.5 cursor-pointer ${dis ? 'opacity-40 cursor-not-allowed' : ''}`}>
              <input
                type="checkbox" checked={sel} disabled={dis}
                onChange={e => updateItem(
                  item.tempId, 'selectedFibers',
                  e.target.checked
                    ? [...item.selectedFibers, fibra.id]
                    : item.selectedFibers.filter(id => id !== fibra.id)
                )}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-xs font-semibold text-indigo-700">{fibra.name}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
