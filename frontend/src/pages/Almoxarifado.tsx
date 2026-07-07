import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { FilePlus, Search } from 'lucide-react'
import { useAPI } from '@/hooks/useAPI'
import { format, addBusinessDays, isValid } from 'date-fns'
import { FichaProducao } from '@/components/Ficha'
import { OPForm } from '@/components/almoxarifado/OPForm'
import { OPTable } from '@/components/almoxarifado/OPTable'
import { Printer } from 'lucide-react'

interface Fibra { id: number; name: string }
interface Item {
  id?: number; material: string; quantity: string
  unit: 'metros' | 'unidades' | 'kg'
  requiresLab: boolean; requiresFabricQuality: boolean
  selectedFibers: number[]; tempId: string
}
interface POItem { material: string; quantity: number; unit: string; individual_op: string }
interface CreatedPO {
  id: number; op_number: string; client: string; color: string
  order_number: string | null; description: string | null
  entry_date: string; expected_date: string; items: POItem[]
}
interface ExistingPO {
  id: number; op_number: string; client: string; color: string
  order_number: string | null; description: string | null
  entry_date: string; expected_date: string; status: string; created_at: string
}

const safeDate = (d: unknown): Date => {
  if (!d) return new Date()
  if (d instanceof Date) return isValid(d) ? d : new Date()
  const s = String(d).trim()
  if (!s) return new Date()
  const a = new Date(s); if (isValid(a)) return a
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) { const b = new Date(s + 'T12:00:00'); if (isValid(b)) return b }
  return new Date()
}
const fmt = (d: unknown, mask = 'dd/MM/yy') => { try { return format(safeDate(d), mask) } catch { return '' } }
const unitLabel = (u: string) => u === 'metros' ? 'M' : u === 'kg' ? 'KG' : 'UN'
const statusLabel = (s: string) => (({ almoxarifado: 'Almoxarifado', qualidade_malhas: 'Qualidade de Malhas', laboratorio: 'Laboratório', preparacao: 'Preparação', producao: 'Produção', secadora: 'Secadora', destrinchagem: 'Destrinchagem', enrolagem: 'Enrolagem', qualidade: 'Qualidade', concluido: 'Concluído' } as Record<string, string>)[s] || s)

export default function Almoxarifado() {
  const { get, post, put, del } = useAPI()
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<'new' | 'manage'>('new')
  const [searchTerm, setSearchTerm] = useState('')
  const [existingOPs, setExistingOPs] = useState<ExistingPO[]>([])
  const [editingOP, setEditingOP] = useState<number | null>(null)
  const [client, setClient] = useState('')
  const [color, setColor] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [description, setDescription] = useState('')
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0])
  const [expectedDate, setExpectedDate] = useState(addBusinessDays(new Date(), 5).toISOString().split('T')[0])
  const [regionJaragua, setRegionJaragua] = useState(false)
  const [regionBrusque, setRegionBrusque] = useState(false)
  const [regionGaspar, setRegionGaspar] = useState(false)
  const [fibras, setFibras] = useState<Fibra[]>([])
  const [items, setItems] = useState<Item[]>([{ material: '', quantity: '', unit: 'metros', requiresLab: false, requiresFabricQuality: false, selectedFibers: [], tempId: crypto.randomUUID() }])
  const [createdPO, setCreatedPO] = useState<CreatedPO | null>(null)
  const [nextOPNumber, setNextOPNumber] = useState('001')

  const handleEntryDateChange = (v: string) => {
    setEntryDate(v)
    setExpectedDate(addBusinessDays(new Date(v + 'T12:00:00'), 5).toISOString().split('T')[0])
  }

  useEffect(() => { fetchNextOPNumber(); fetchFibras() }, [])
  useEffect(() => { if (view === 'manage') fetchExistingOPs() }, [view])

  const fetchFibras = async () => { try { setFibras(await get<Fibra[]>('/fibras')) } catch {} }
  const fetchNextOPNumber = async () => { try { const r = await get<{ next_op_number: string }>('/production-orders/next-op-number'); setNextOPNumber(r.next_op_number) } catch {} }
  const fetchExistingOPs = async () => { try { setExistingOPs(await get<ExistingPO[]>('/production-orders')) } catch {} }
  const getItemOP = (i: number) => String(parseInt(nextOPNumber) + i).padStart(3, '0')
  const addItem = () => setItems([...items, { material: '', quantity: '', unit: 'metros', requiresLab: false, requiresFabricQuality: false, selectedFibers: [], tempId: crypto.randomUUID() }])
  const removeItem = (t: string) => { if (items.length > 1) setItems(items.filter(i => i.tempId !== t)) }
  const updateItem = (t: string, f: keyof Item, v: unknown) => setItems(items.map(i => i.tempId === t ? { ...i, [f]: v } : i))

  const buildPayload = () => ({
    client: client.toUpperCase(), color: color.toUpperCase(),
    order_number: orderNumber ? orderNumber.toUpperCase() : undefined,
    description: description ? description.toUpperCase() : undefined,
    entry_date: new Date(entryDate + 'T12:00:00').toISOString(),
    expected_date: new Date(expectedDate + 'T12:00:00').toISOString(),
    region_jaragua: regionJaragua, region_brusque: regionBrusque, region_gaspar: regionGaspar,
    items: items.map(it => ({ material: it.material.toUpperCase(), quantity: parseFloat(it.quantity) || 0, unit: it.unit, requires_lab: it.requiresLab, requires_fabric_quality: it.requiresFabricQuality, fiber_id: it.selectedFibers[0] || null, is_dual_fiber: it.selectedFibers.length >= 2, fiber2_id: it.selectedFibers[1] || null })),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!client || !color || items.some(i => !i.material || !i.quantity)) { alert('Preencha todos os campos obrigatórios'); return }
    setLoading(true)
    try {
      if (editingOP) { await put(`/production-orders/${editingOP}`, buildPayload()); setCreatedPO(await get<CreatedPO>(`/production-orders/${editingOP}`)); setEditingOP(null) }
      else { const r = await post<{ id: number }>('/production-orders', buildPayload()); setCreatedPO(await get<CreatedPO>(`/production-orders/${r.id}`)) }
    } catch { alert(editingOP ? 'Erro ao atualizar ficha' : 'Erro ao criar ficha') } finally { setLoading(false) }
  }

  const handleEdit = async (op: ExistingPO) => {
    try {
      const d = await get<any>(`/production-orders/${op.id}`)
      setEditingOP(op.id); setClient(d.client); setColor(d.color)
      setOrderNumber(d.order_number || ''); setDescription(d.description || '')
      setEntryDate(safeDate(d.entry_date).toISOString().split('T')[0])
      setExpectedDate(safeDate(d.expected_date).toISOString().split('T')[0])
      setRegionJaragua(!!d.region_jaragua); setRegionBrusque(!!d.region_brusque); setRegionGaspar(!!d.region_gaspar)
      setItems(d.items.map((it: any) => { const f: number[] = []; if (it.fiber_id) f.push(it.fiber_id); if (it.fiber2_id) f.push(it.fiber2_id); return { id: it.id, material: it.material, quantity: String(it.quantity || ''), unit: it.unit || 'metros', requiresLab: !!it.requires_lab, requiresFabricQuality: !!it.requires_fabric_quality, selectedFibers: f, tempId: crypto.randomUUID() } }))
      setView('new')
    } catch { alert('Erro ao carregar OP') }
  }

  const handleReprint = async (op: ExistingPO) => { try { setCreatedPO(await get<CreatedPO>(`/production-orders/${op.id}`)) } catch { alert('Erro ao carregar OP') } }
  const handleDelete = async (op: ExistingPO) => {
    if (!confirm(`Excluir OP ${op.op_number}?`)) return
    try { await del(`/production-orders/${op.id}`); alert('OP excluída'); fetchExistingOPs() } catch { alert('Erro ao excluir') }
  }

  const handleNewPO = () => {
    setCreatedPO(null); setEditingOP(null); setClient(''); setColor(''); setOrderNumber(''); setDescription('')
    setEntryDate(new Date().toISOString().split('T')[0])
    setExpectedDate(addBusinessDays(new Date(), 5).toISOString().split('T')[0])
    setRegionJaragua(false); setRegionBrusque(false); setRegionGaspar(false)
    setItems([{ material: '', quantity: '', unit: 'metros', requiresLab: false, requiresFabricQuality: false, selectedFibers: [], tempId: crypto.randomUUID() }])
    fetchNextOPNumber()
  }

  const filteredOPs = existingOPs.filter(op =>
    op.op_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.color.toLowerCase().includes(searchTerm.toLowerCase())
  )

  /* ── FICHA ── */
  if (createdPO) {
    const hora = format(new Date(), 'HH:mm')
    const materiais = (createdPO.items ?? []).map(it =>
      `${it.material?.toUpperCase() ?? ''}: ${it.quantity ?? ''}${unitLabel(it.unit ?? 'metros')} OP- ${it.individual_op ?? ''}`
    )
    return (
      <Layout>
        <div className="print:hidden" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700 }}>Ficha — OP {createdPO.op_number}</h1>
            <p style={{ color: '#666', fontSize: 13 }}>{(createdPO.items ?? []).length} item(ns)</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 7, padding: '9px 20px', fontWeight: 700, cursor: 'pointer' }}>
              <Printer size={15} /> Imprimir
            </button>
            <button onClick={handleNewPO} style={{ background: '#15803d', color: '#fff', border: 'none', borderRadius: 7, padding: '9px 20px', fontWeight: 700, cursor: 'pointer' }}>
              Nova Ficha
            </button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <FichaProducao
            nomeCliente={createdPO.client?.toUpperCase() ?? ''}
            cor={createdPO.color?.toUpperCase() ?? ''}
            noPedido={createdPO.order_number ?? ''}
            hora={hora}
            entrada={fmt(createdPO.entry_date)}
            retorno={fmt(createdPO.expected_date)}
            numero={(() => { try { return format(safeDate(createdPO.expected_date), 'dd') } catch { return '--' } })()}
            materiais={materiais}
          />
        </div>
        <p className="print:hidden" style={{ textAlign: 'center', color: '#aaa', fontSize: 13, marginTop: 12 }}>Ctrl+P para imprimir</p>
      </Layout>
    )
  }

  /* ── PÁGINA PRINCIPAL ── */
  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Almoxarifado</h1>
          <p className="text-gray-600">Gerenciar fichas de produção</p>
        </div>

        {/* Toggle Nova / Gerenciar */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2">
          <div className="flex gap-2">
            <button onClick={() => setView('new')} className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${view === 'new' ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <FilePlus className="w-5 h-5" /> {editingOP ? 'Editar Ficha' : 'Nova Ficha'}
            </button>
            <button onClick={() => setView('manage')} className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${view === 'manage' ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <Search className="w-5 h-5" /> Gerenciar Fichas
            </button>
          </div>
        </div>

        {view === 'manage' ? (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Buscar por OP, cliente ou cor..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <OPTable
              filteredOPs={filteredOPs}
              onEdit={handleEdit}
              onReprint={handleReprint}
              onDelete={handleDelete}
              fmt={fmt}
              statusLabel={statusLabel}
            />
          </div>
        ) : (
          <OPForm
            loading={loading}
            editingOP={editingOP}
            client={client} setClient={setClient}
            color={color} setColor={setColor}
            orderNumber={orderNumber} setOrderNumber={setOrderNumber}
            description={description} setDescription={setDescription}
            entryDate={entryDate}
            expectedDate={expectedDate} setExpectedDate={setExpectedDate}
            handleEntryDateChange={handleEntryDateChange}
            regionJaragua={regionJaragua} setRegionJaragua={setRegionJaragua}
            regionBrusque={regionBrusque} setRegionBrusque={setRegionBrusque}
            regionGaspar={regionGaspar} setRegionGaspar={setRegionGaspar}
            fibras={fibras}
            items={items}
            addItem={addItem}
            updateItem={updateItem}
            removeItem={removeItem}
            getItemOP={getItemOP}
            existingOPs={existingOPs}
            handleNewPO={handleNewPO}
            handleSubmit={handleSubmit}
          />
        )}
      </div>
    </Layout>
  )
}
