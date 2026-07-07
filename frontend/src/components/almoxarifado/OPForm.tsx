import { Plus, PackagePlus } from 'lucide-react'
import { ItemRow } from './ItemRow'

interface Fibra { id: number; name: string }
interface Item {
  id?: number; material: string; quantity: string
  unit: 'metros' | 'unidades' | 'kg'
  requiresLab: boolean; requiresFabricQuality: boolean
  selectedFibers: number[]; tempId: string
}
interface ExistingPO {
  id: number; op_number: string; client: string; color: string
  order_number: string | null; description: string | null
  entry_date: string; expected_date: string; status: string; created_at: string
}

interface Props {
  loading: boolean
  editingOP: number | null
  client: string; setClient: (v: string) => void
  color: string; setColor: (v: string) => void
  orderNumber: string; setOrderNumber: (v: string) => void
  description: string; setDescription: (v: string) => void
  entryDate: string
  expectedDate: string; setExpectedDate: (v: string) => void
  handleEntryDateChange: (v: string) => void
  regionJaragua: boolean; setRegionJaragua: (v: boolean) => void
  regionBrusque: boolean; setRegionBrusque: (v: boolean) => void
  regionGaspar: boolean; setRegionGaspar: (v: boolean) => void
  fibras: Fibra[]
  items: Item[]
  addItem: () => void
  updateItem: (tempId: string, field: keyof Item, value: unknown) => void
  removeItem: (tempId: string) => void
  getItemOP: (i: number) => string
  existingOPs: ExistingPO[]
  handleNewPO: () => void
  handleSubmit: (e: React.FormEvent) => void
}

export function OPForm({
  loading, editingOP, client, setClient, color, setColor, orderNumber, setOrderNumber,
  description, setDescription, entryDate, expectedDate, setExpectedDate, handleEntryDateChange,
  regionJaragua, setRegionJaragua, regionBrusque, setRegionBrusque, regionGaspar, setRegionGaspar,
  fibras, items, addItem, updateItem, removeItem, getItemOP, existingOPs, handleNewPO, handleSubmit
}: Props) {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <PackagePlus className="w-6 h-6 mr-2 text-blue-600" /> Informações Básicas
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cliente *</label>
            <input type="text" value={client} onChange={e => setClient(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
              placeholder="Nome do cliente" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cor *</label>
            <input type="text" value={color} onChange={e => setColor(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
              placeholder="Nome da cor" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nº Pedido</label>
            <input type="text" value={orderNumber} onChange={e => setOrderNumber(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
              placeholder="Número do pedido" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Data de Entrada *</label>
            <input type="date" value={entryDate} onChange={e => handleEntryDateChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Previsão de Saída *</label>
            <input type="date" value={expectedDate} onChange={e => setExpectedDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Regiões</label>
            <div className="flex gap-4 items-center h-[50px] px-4 bg-orange-50 border border-orange-200 rounded-lg">
              {([
                ['Jaraguá', regionJaragua, setRegionJaragua],
                ['Brusque', regionBrusque, setRegionBrusque],
                ['Gaspar', regionGaspar, setRegionGaspar],
              ] as const).map(([l, v, s]) => (
                <label key={l as string} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={v as boolean}
                    onChange={e => (s as (x: boolean) => void)(e.target.checked)}
                    className="w-5 h-5 text-orange-600 rounded" />
                  <span className="text-sm font-semibold text-orange-700">{l as string}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
          <textarea value={description} onChange={e => setDescription(e.target.value.toUpperCase())}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
            rows={3} placeholder="Informações adicionais..." />
        </div>
      </div>

      {/* Itens */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Itens da Produção</h2>
          <button type="button" onClick={addItem}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md">
            <Plus className="w-5 h-5" /> Adicionar Item
          </button>
        </div>
        <div className="space-y-4">
          {items.map((item, index) => (
            <ItemRow
              key={item.tempId}
              item={item}
              index={index}
              fibras={fibras}
              editingOP={editingOP}
              existingOPNumber={existingOPs.find(o => o.id === editingOP)?.op_number}
              getItemOP={getItemOP}
              updateItem={updateItem}
              removeItem={removeItem}
              totalItems={items.length}
            />
          ))}
        </div>
      </div>

      {/* Ações */}
      <div className="flex justify-end gap-3">
        {editingOP && (
          <button type="button" onClick={handleNewPO}
            className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-lg font-semibold text-lg">
            Cancelar
          </button>
        )}
        <button type="submit" disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg disabled:opacity-50">
          {loading ? 'Processando...' : editingOP ? 'Atualizar Ficha' : 'Gerar Ficha de Produção'}
        </button>
      </div>
    </form>
  )
}
