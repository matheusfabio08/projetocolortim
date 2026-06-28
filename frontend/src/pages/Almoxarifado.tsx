import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Plus, Trash2, PackagePlus, Printer, Search, Edit2, FilePlus } from "lucide-react";
import { useAPI } from "@/hooks/useAPI";
import { format, addBusinessDays, isValid } from "date-fns";

interface Fibra { id: number; name: string; }
interface Item {
  id?: number;
  material: string;
  quantity: string;
  unit: "metros" | "unidades" | "kg";
  requiresLab: boolean;
  requiresFabricQuality: boolean;
  selectedFibers: number[];
  tempId: string;
}
interface POItem { material: string; quantity: number; unit: string; individual_op: string; }
interface CreatedPO {
  id: number; op_number: string; client: string; color: string;
  order_number: string | null; description: string | null;
  entry_date: string; expected_date: string; items: POItem[];
}
interface ExistingPO {
  id: number; op_number: string; client: string; color: string;
  order_number: string | null; description: string | null;
  entry_date: string; expected_date: string; status: string; created_at: string;
}

/**
 * Converte qualquer valor de data vindo da API em um Date válido.
 * Suporta: ISO completo, YYYY-MM-DD, Date object, null/undefined.
 */
const safeParseDate = (d: unknown): Date => {
  if (!d) return new Date();
  if (d instanceof Date) return isValid(d) ? d : new Date();
  const str = String(d).trim();
  if (!str) return new Date();
  // tenta parsear diretamente
  const direct = new Date(str);
  if (isValid(direct)) return direct;
  // tenta como data local (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const local = new Date(str + 'T12:00:00');
    if (isValid(local)) return local;
  }
  return new Date();
};

const fmtDate = (d: unknown) => {
  try { return format(safeParseDate(d), 'dd/MM/yy'); } catch { return ''; }
};

const fmtDateLong = (d: unknown) => {
  try { return format(safeParseDate(d), 'dd/MM/yyyy'); } catch { return ''; }
};

export default function Almoxarifado() {
  const { get, post, put, del } = useAPI();
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"new" | "manage">("new");
  const [searchTerm, setSearchTerm] = useState("");
  const [existingOPs, setExistingOPs] = useState<ExistingPO[]>([]);
  const [editingOP, setEditingOP] = useState<number | null>(null);
  const [client, setClient] = useState("");
  const [color, setColor] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [description, setDescription] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedDate, setExpectedDate] = useState(addBusinessDays(new Date(), 5).toISOString().split('T')[0]);
  const [regionJaragua, setRegionJaragua] = useState(false);
  const [regionBrusque, setRegionBrusque] = useState(false);
  const [regionGaspar, setRegionGaspar] = useState(false);
  const [fibras, setFibras] = useState<Fibra[]>([]);
  const [items, setItems] = useState<Item[]>([{ material: "", quantity: "", unit: "metros", requiresLab: false, requiresFabricQuality: false, selectedFibers: [], tempId: crypto.randomUUID() }]);
  const [createdPO, setCreatedPO] = useState<CreatedPO | null>(null);
  const [nextOPNumber, setNextOPNumber] = useState<string>("001");

  const handleEntryDateChange = (v: string) => {
    setEntryDate(v);
    setExpectedDate(addBusinessDays(new Date(v + 'T12:00:00'), 5).toISOString().split('T')[0]);
  };

  useEffect(() => { fetchNextOPNumber(); fetchFibras(); }, []);
  useEffect(() => { if (view === "manage") fetchExistingOPs(); }, [view]);

  const fetchFibras = async () => { try { setFibras(await get<Fibra[]>("/fibras")); } catch { /* ignore */ } };
  const fetchNextOPNumber = async () => { try { const r = await get<{ next_op_number: string }>("/production-orders/next-op-number"); setNextOPNumber(r.next_op_number); } catch { /* ignore */ } };
  const fetchExistingOPs = async () => { try { setExistingOPs(await get<ExistingPO[]>("/production-orders")); } catch { /* ignore */ } };
  const getItemOPNumber = (i: number) => String(parseInt(nextOPNumber) + i).padStart(3, '0');
  const addItem = () => setItems([...items, { material: "", quantity: "", unit: "metros", requiresLab: false, requiresFabricQuality: false, selectedFibers: [], tempId: crypto.randomUUID() }]);
  const removeItem = (t: string) => { if (items.length > 1) setItems(items.filter(i => i.tempId !== t)); };
  const updateItem = (t: string, f: keyof Item, v: unknown) => setItems(items.map(i => i.tempId === t ? { ...i, [f]: v } : i));

  const buildPayload = () => ({
    client: client.toUpperCase(), color: color.toUpperCase(),
    order_number: orderNumber ? orderNumber.toUpperCase() : undefined,
    description: description ? description.toUpperCase() : undefined,
    entry_date: new Date(entryDate + 'T12:00:00').toISOString(),
    expected_date: new Date(expectedDate + 'T12:00:00').toISOString(),
    region_jaragua: regionJaragua, region_brusque: regionBrusque, region_gaspar: regionGaspar,
    items: items.map(item => ({
      material: item.material.toUpperCase(), quantity: parseFloat(item.quantity) || 0, unit: item.unit,
      requires_lab: item.requiresLab, requires_fabric_quality: item.requiresFabricQuality,
      fiber_id: item.selectedFibers[0] || null, is_dual_fiber: item.selectedFibers.length >= 2, fiber2_id: item.selectedFibers[1] || null,
    })),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !color || items.some(i => !i.material || !i.quantity)) { alert("Preencha todos os campos obrigatórios"); return; }
    setLoading(true);
    try {
      if (editingOP) {
        await put(`/production-orders/${editingOP}`, buildPayload());
        setCreatedPO(await get<CreatedPO>(`/production-orders/${editingOP}`));
        setEditingOP(null);
      } else {
        const r = await post<{ id: number }>("/production-orders", buildPayload());
        setCreatedPO(await get<CreatedPO>(`/production-orders/${r.id}`));
      }
    } catch { alert(editingOP ? "Erro ao atualizar ficha" : "Erro ao criar ficha"); }
    finally { setLoading(false); }
  };

  const handleEdit = async (op: ExistingPO) => {
    try {
      const d = await get<any>(`/production-orders/${op.id}`);
      setEditingOP(op.id); setClient(d.client); setColor(d.color);
      setOrderNumber(d.order_number || ''); setDescription(d.description || '');
      setEntryDate(safeParseDate(d.entry_date).toISOString().split('T')[0]);
      setExpectedDate(safeParseDate(d.expected_date).toISOString().split('T')[0]);
      setRegionJaragua(!!d.region_jaragua); setRegionBrusque(!!d.region_brusque); setRegionGaspar(!!d.region_gaspar);
      setItems(d.items.map((it: any) => {
        const f: number[] = [];
        if (it.fiber_id) f.push(it.fiber_id);
        if (it.fiber2_id) f.push(it.fiber2_id);
        return { id: it.id, material: it.material, quantity: String(it.quantity || ''), unit: it.unit || 'metros', requiresLab: !!it.requires_lab, requiresFabricQuality: !!it.requires_fabric_quality, selectedFibers: f, tempId: crypto.randomUUID() };
      }));
      setView("new");
    } catch { alert("Erro ao carregar OP"); }
  };

  const handleReprint = async (op: ExistingPO) => { try { setCreatedPO(await get<CreatedPO>(`/production-orders/${op.id}`)); } catch { alert("Erro ao carregar OP"); } };
  const handleDelete = async (op: ExistingPO) => {
    if (!confirm(`Excluir OP ${op.op_number}?`)) return;
    try { await del(`/production-orders/${op.id}`); alert("OP excluída"); fetchExistingOPs(); } catch { alert("Erro ao excluir"); }
  };

  const handleNewPO = () => {
    setCreatedPO(null); setEditingOP(null); setClient(''); setColor(''); setOrderNumber(''); setDescription('');
    setEntryDate(new Date().toISOString().split('T')[0]);
    setExpectedDate(addBusinessDays(new Date(), 5).toISOString().split('T')[0]);
    setRegionJaragua(false); setRegionBrusque(false); setRegionGaspar(false);
    setItems([{ material: '', quantity: '', unit: 'metros', requiresLab: false, requiresFabricQuality: false, selectedFibers: [], tempId: crypto.randomUUID() }]);
    fetchNextOPNumber();
  };

  const filteredOPs = existingOPs.filter(op =>
    op.op_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.color.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusLabel = (s: string) => (({ almoxarifado: 'Almoxarifado', qualidade_malhas: 'Qualidade de Malhas', laboratorio: 'Laboratório', preparacao: 'Preparação', producao: 'Produção', secadora: 'Secadora', destrinchagem: 'Destrinchagem', enrolagem: 'Enrolagem', qualidade: 'Qualidade', concluido: 'Concluído' } as Record<string, string>)[s] || s);

  // ═══════════════════════════════════════
  //  FICHA DE IMPRESSÃO
  // ═══════════════════════════════════════
  if (createdPO) {
    const horaAtual = format(new Date(), 'HH:mm');
    const diaRetorno = (() => { try { return format(safeParseDate(createdPO.expected_date), 'dd'); } catch { return '--'; } })();

    return (
      <Layout>
        <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ficha Gerada com Sucesso</h1>
            <p className="text-gray-500 text-sm mt-1">OP {createdPO.op_number} &middot; {createdPO.items.length} item(ns)</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => window.print()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold print:hidden">
              <Printer className="w-4 h-4" /> Imprimir
            </button>
            <button onClick={handleNewPO} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold print:hidden">Nova Ficha</button>
          </div>
        </div>

        <style>{`
          @media print {
            body > * { display: none !important; }
            .ficha-print-wrapper { display: block !important; }
            .ficha-print-wrapper * { visibility: visible !important; }
            .print-hidden { display: none !important; }
            @page { size: A4 portrait; margin: 8mm; }
          }
          .f-ficha {
            font-family: Arial, Helvetica, sans-serif;
            width: 190mm;
            max-width: 100%;
            border: 2.5px solid #000;
            background: #fff;
            box-sizing: border-box;
            margin: 0 auto;
          }
          .f-topo { display: grid; grid-template-columns: 60% 40%; }
          .f-col-esq { border-right: 2px solid #000; display: flex; flex-direction: column; }
          .f-nome-cliente { font-size: 32px; font-weight: 900; padding: 10px 12px; border-bottom: 1.5px solid #000; line-height: 1.1; }
          .f-linha-cor { display: grid; grid-template-columns: 1fr 90px; border-bottom: 1.5px solid #000; min-height: 90px; }
          .f-cor-texto { font-size: 26px; font-weight: 900; display: flex; align-items: center; justify-content: center; padding: 8px; border-right: 1.5px solid #000; }
          .f-img-box { background: #fff; }
          .f-materiais { padding: 8px 10px; min-height: 70px; font-size: 10.5px; font-weight: 700; line-height: 1.7; }
          .f-col-dir { display: flex; flex-direction: column; }
          .f-info-table { width: 100%; border-collapse: collapse; }
          .f-info-table td { height: 22px; padding: 2px 7px; font-size: 10.5px; font-weight: 800; border-bottom: 1.5px solid #000; }
          .f-info-table td.f-lbl { width: 50%; border-right: 1.5px solid #000; }
          .f-info-table td.f-val { text-align: right; font-weight: 700; }
          .f-num-grande { flex: 1; display: flex; align-items: center; justify-content: center; border-bottom: 1.5px solid #000; padding: 4px; }
          .f-num-grande span { font-size: 100px; font-weight: 900; line-height: 1; }
          .f-esp-label { font-size: 10.5px; font-weight: 900; padding: 3px 7px 4px; }
          .f-rodape { display: grid; grid-template-columns: 50% 50%; height: 100px; border-top: 2px solid #000; }
          .f-desc-box { border-right: 1.5px solid #000; display: flex; flex-direction: column; justify-content: flex-end; padding: 0 10px 5px; }
          .f-desc-line { border-top: 1.5px solid #000; margin-bottom: 3px; }
          .f-desc-label { font-size: 11px; font-weight: 900; text-align: center; }
          .f-checks-box { display: flex; flex-direction: column; justify-content: space-evenly; padding: 6px 16px; }
          .f-check-row { display: flex; align-items: center; gap: 8px; }
          .f-boxes { display: flex; flex-direction: column; gap: 3px; }
          .f-caixa { width: 14px; height: 14px; border: 1.5px solid #000; }
          .f-check-lbl { font-size: 11px; font-weight: 900; }
        `}</style>

        <div className="ficha-print-wrapper">
          <div className="f-ficha">
            <div className="f-topo">
              <div className="f-col-esq">
                <div className="f-nome-cliente">{createdPO.client?.toUpperCase() ?? ''}</div>
                <div className="f-linha-cor">
                  <div className="f-cor-texto">{createdPO.color?.toUpperCase() ?? ''}</div>
                  <div className="f-img-box" />
                </div>
                <div className="f-materiais">
                  {(createdPO.items ?? []).map((it, i) => (
                    <div key={i}>
                      {it.material?.toUpperCase() ?? ''}: {it.quantity ?? ''}
                      {it.unit === 'metros' ? 'M' : it.unit === 'kg' ? 'KG' : 'UN'} OP- {it.individual_op ?? ''}
                    </div>
                  ))}
                </div>
              </div>
              <div className="f-col-dir">
                <table className="f-info-table">
                  <tbody>
                    <tr><td className="f-lbl">Nº PEDIDO</td><td className="f-val">{createdPO.order_number ?? ''}</td></tr>
                    <tr><td className="f-lbl">HORA</td><td className="f-val">{horaAtual}</td></tr>
                    <tr><td className="f-lbl">ENTRADA</td><td className="f-val">{fmtDate(createdPO.entry_date)}</td></tr>
                    <tr><td className="f-lbl">RETORNO</td><td className="f-val">{fmtDate(createdPO.expected_date)}</td></tr>
                    <tr><td className="f-lbl">CONF.</td><td className="f-val"></td></tr>
                  </tbody>
                </table>
                <div className="f-num-grande"><span>{diaRetorno}</span></div>
                <div className="f-esp-label">ESPECIFICAÇÕES</div>
              </div>
            </div>
            <div className="f-rodape">
              <div className="f-desc-box">
                <div className="f-desc-line" />
                <div className="f-desc-label">DESCRIÇÃO</div>
              </div>
              <div className="f-checks-box">
                <div className="f-check-row">
                  <div className="f-boxes"><div className="f-caixa" /><div className="f-caixa" /><div className="f-caixa" /></div>
                  <span className="f-check-lbl">SOLIDEZ</span>
                </div>
                <div className="f-check-row">
                  <div className="f-boxes"><div className="f-caixa" /><div className="f-caixa" /></div>
                  <span className="f-check-lbl">APROVAÇÃO</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-5 print:hidden">Ctrl+P para imprimir</p>
      </Layout>
    );
  }

  // ═══════════════════════════════════════
  //  FORMULÁRIO
  // ═══════════════════════════════════════
  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Almoxarifado</h1>
          <p className="text-gray-600">Gerenciar fichas de produção</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2">
          <div className="flex gap-2">
            <button onClick={() => setView("new")}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${view === "new" ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              <FilePlus className="w-5 h-5" /> {editingOP ? "Editar Ficha" : "Nova Ficha"}
            </button>
            <button onClick={() => setView("manage")}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${view === "manage" ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              <Search className="w-5 h-5" /> Gerenciar Fichas
            </button>
          </div>
        </div>

        {view === "manage" ? (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Buscar por OP, cliente ou cor..."
                  value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>{["OP", "Cliente", "Cor", "Status", "Previsão", "Ações"].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredOPs.length > 0 ? filteredOPs.map(op => (
                      <tr key={op.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold text-blue-600">{op.op_number}</td>
                        <td className="px-6 py-4">{op.client}</td>
                        <td className="px-6 py-4">{op.color}</td>
                        <td className="px-6 py-4"><span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{getStatusLabel(op.status)}</span></td>
                        <td className="px-6 py-4 text-sm text-gray-600">{fmtDateLong(op.expected_date)}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => handleEdit(op)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleReprint(op)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Printer className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(op)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
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
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <PackagePlus className="w-6 h-6 mr-2 text-blue-600" /> Informações Básicas
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cliente *</label>
                  <input type="text" value={client} onChange={e => setClient(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase" placeholder="Nome do cliente" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cor *</label>
                  <input type="text" value={color} onChange={e => setColor(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase" placeholder="Nome da cor" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nº Pedido</label>
                  <input type="text" value={orderNumber} onChange={e => setOrderNumber(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase" placeholder="Número do pedido" />
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
                  <div className="flex gap-4 items-center h-[50px] px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg">
                    {([['Jaraguá', regionJaragua, setRegionJaragua], ['Brusque', regionBrusque, setRegionBrusque], ['Gaspar', regionGaspar, setRegionGaspar]] as const).map(([lbl, val, set]) => (
                      <label key={lbl as string} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={val as boolean} onChange={e => (set as (v: boolean) => void)(e.target.checked)} className="w-5 h-5 text-orange-600 rounded" />
                        <span className="text-sm font-semibold text-orange-700">{lbl as string}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
                <textarea value={description} onChange={e => setDescription(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase" rows={3} placeholder="Informações adicionais..." />
              </div>
            </div>

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
                  <div key={item.tempId} className="p-4 border-2 border-gray-200 rounded-xl bg-gray-50">
                    <div className="grid grid-cols-12 gap-3 mb-3">
                      <div className="col-span-5">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Material *</label>
                        <input type="text" value={item.material} onChange={e => updateItem(item.tempId, 'material', e.target.value.toUpperCase())}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase" placeholder="Ex: ELÁSTICO 10-20MM" required />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Qtd *</label>
                        <input type="number" step="0.01" value={item.quantity} onChange={e => updateItem(item.tempId, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="100" required />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Un *</label>
                        <select value={item.unit} onChange={e => updateItem(item.tempId, 'unit', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                          <option value="metros">m</option>
                          <option value="unidades">un</option>
                          <option value="kg">kg</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">OP</label>
                        <div className="px-2 py-2 border border-gray-200 rounded-lg bg-blue-50 text-sm text-blue-700 font-semibold text-center">
                          {editingOP ? existingOPs.find(o => o.id === editingOP)?.op_number || '' : getItemOPNumber(index)}
                        </div>
                      </div>
                      <div className="col-span-1 flex items-end">
                        <button type="button" onClick={() => removeItem(item.tempId)} disabled={items.length === 1}
                          className="w-full p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg disabled:opacity-40">
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-200">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={item.requiresLab} onChange={e => updateItem(item.tempId, 'requiresLab', e.target.checked)} className="w-4 h-4 text-purple-600 rounded" />
                        <span className="text-xs font-semibold text-purple-700">Laboratório</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={item.requiresFabricQuality} onChange={e => updateItem(item.tempId, 'requiresFabricQuality', e.target.checked)} className="w-4 h-4 text-teal-600 rounded" />
                        <span className="text-xs font-semibold text-teal-700">Qualidade de Malha</span>
                      </label>
                      <div className="h-4 w-px bg-gray-300" />
                      <span className="text-xs font-semibold text-gray-500">Fibras (máx 2):</span>
                      {fibras.length === 0 ? (
                        <span className="text-xs text-gray-400 italic">Carregando...</span>
                      ) : fibras.map(fibra => {
                        const sel = item.selectedFibers.includes(fibra.id);
                        const dis = !sel && item.selectedFibers.length >= 2;
                        return (
                          <label key={fibra.id} className={`flex items-center gap-1.5 cursor-pointer ${dis ? 'opacity-40 cursor-not-allowed' : ''}`}>
                            <input type="checkbox" checked={sel} disabled={dis}
                              onChange={e => updateItem(item.tempId, 'selectedFibers', e.target.checked ? [...item.selectedFibers, fibra.id] : item.selectedFibers.filter(id => id !== fibra.id))}
                              className="w-4 h-4 text-indigo-600 rounded" />
                            <span className="text-xs font-semibold text-indigo-700">{fibra.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              {editingOP && (
                <button type="button" onClick={handleNewPO} className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-lg font-semibold text-lg">Cancelar</button>
              )}
              <button type="submit" disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg disabled:opacity-50">
                {loading ? 'Processando...' : editingOP ? 'Atualizar Ficha' : 'Gerar Ficha de Produção'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}
