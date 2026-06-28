import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Plus, Trash2, PackagePlus, Printer, Search, Edit2, FilePlus } from "lucide-react";
import { useAPI } from "@/hooks/useAPI";
import { format, addBusinessDays } from "date-fns";

interface Fibra {
  id: number;
  name: string;
}

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

interface POItem {
  material: string;
  quantity: number;
  unit: string;
  individual_op: string;
}

interface CreatedPO {
  id: number;
  op_number: string;
  client: string;
  color: string;
  order_number: string | null;
  description: string | null;
  entry_date: string;
  expected_date: string;
  items: POItem[];
}

interface ExistingPO {
  id: number;
  op_number: string;
  client: string;
  color: string;
  order_number: string | null;
  description: string | null;
  entry_date: string;
  expected_date: string;
  status: string;
  created_at: string;
}

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
  const [expectedDate, setExpectedDate] = useState(
    addBusinessDays(new Date(), 5).toISOString().split('T')[0]
  );
  const [regionJaragua, setRegionJaragua] = useState(false);
  const [regionBrusque, setRegionBrusque] = useState(false);
  const [regionGaspar, setRegionGaspar] = useState(false);
  const [fibras, setFibras] = useState<Fibra[]>([]);

  const handleEntryDateChange = (newEntryDate: string) => {
    setEntryDate(newEntryDate);
    const entryDateObj = new Date(newEntryDate + 'T12:00:00');
    const newExpectedDate = addBusinessDays(entryDateObj, 5);
    setExpectedDate(newExpectedDate.toISOString().split('T')[0]);
  };

  const [items, setItems] = useState<Item[]>([{
    material: "",
    quantity: "",
    unit: "metros",
    requiresLab: false,
    requiresFabricQuality: false,
    selectedFibers: [],
    tempId: crypto.randomUUID()
  }]);
  const [createdPO, setCreatedPO] = useState<CreatedPO | null>(null);
  const [nextOPNumber, setNextOPNumber] = useState<string>("001");

  useEffect(() => {
    fetchNextOPNumber();
    fetchFibras();
  }, []);

  const fetchFibras = async () => {
    try {
      const result = await get<Fibra[]>("/fibras");
      setFibras(result);
    } catch (error) {
      console.error("Erro ao buscar fibras:", error);
    }
  };

  useEffect(() => {
    if (view === "manage") fetchExistingOPs();
  }, [view]);

  const fetchNextOPNumber = async () => {
    try {
      const result = await get<{ next_op_number: string}>("/production-orders/next-op-number");
      setNextOPNumber(result.next_op_number);
    } catch (error) {
      console.error("Erro ao buscar próximo número de OP:", error);
    }
  };

  const fetchExistingOPs = async () => {
    try {
      const result = await get<ExistingPO[]>("/production-orders");
      setExistingOPs(result);
    } catch (error) {
      console.error("Erro ao buscar OPs:", error);
    }
  };

  const getItemOPNumber = (index: number) => {
    if (!nextOPNumber) return "";
    const baseNum = parseInt(nextOPNumber);
    return String(baseNum + index).padStart(3, '0');
  };

  const addItem = () => {
    setItems([...items, {
      material: "",
      quantity: "",
      unit: "metros",
      requiresLab: false,
      requiresFabricQuality: false,
      selectedFibers: [],
      tempId: crypto.randomUUID()
    }]);
  };

  const removeItem = (tempId: string) => {
    if (items.length > 1) setItems(items.filter((item) => item.tempId !== tempId));
  };

  const updateItem = (tempId: string, field: keyof Item, value: unknown) => {
    setItems(items.map((item) => (item.tempId === tempId ? { ...item, [field]: value } : item)));
  };

  const buildPayload = () => ({
    client: client.toUpperCase(),
    color: color.toUpperCase(),
    order_number: orderNumber ? orderNumber.toUpperCase() : undefined,
    description: description ? description.toUpperCase() : undefined,
    entry_date: new Date(entryDate + 'T12:00:00').toISOString(),
    expected_date: new Date(expectedDate + 'T12:00:00').toISOString(),
    region_jaragua: regionJaragua,
    region_brusque: regionBrusque,
    region_gaspar: regionGaspar,
    items: items.map((item) => ({
      material: item.material.toUpperCase(),
      quantity: parseFloat(item.quantity) || 0,
      unit: item.unit,
      requires_lab: item.requiresLab,
      requires_fabric_quality: item.requiresFabricQuality,
      fiber_id: item.selectedFibers[0] || null,
      is_dual_fiber: item.selectedFibers.length >= 2,
      fiber2_id: item.selectedFibers[1] || null,
    })),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !color || items.some((item) => !item.material || !item.quantity)) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    setLoading(true);
    try {
      if (editingOP) {
        await put(`/production-orders/${editingOP}`, buildPayload());
        const opDetails = await get<CreatedPO>(`/production-orders/${editingOP}`);
        setCreatedPO(opDetails);
        setEditingOP(null);
      } else {
        const result = await post<{ id: number }>("/production-orders", buildPayload());
        const opDetails = await get<CreatedPO>(`/production-orders/${result.id}`);
        setCreatedPO(opDetails);
      }
    } catch (error) {
      alert(editingOP ? "Erro ao atualizar ficha de produção" : "Erro ao criar ficha de produção");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (op: ExistingPO) => {
    try {
      const poDetails = await get<any>(`/production-orders/${op.id}`);
      setEditingOP(op.id);
      setClient(poDetails.client);
      setColor(poDetails.color);
      setOrderNumber(poDetails.order_number || "");
      setDescription(poDetails.description || "");
      setEntryDate(new Date(poDetails.entry_date).toISOString().split('T')[0]);
      setExpectedDate(new Date(poDetails.expected_date).toISOString().split('T')[0]);
      setRegionJaragua(!!poDetails.region_jaragua);
      setRegionBrusque(!!poDetails.region_brusque);
      setRegionGaspar(!!poDetails.region_gaspar);
      setItems(poDetails.items.map((item: any) => {
        const fibers: number[] = [];
        if (item.fiber_id) fibers.push(item.fiber_id);
        if (item.fiber2_id) fibers.push(item.fiber2_id);
        return {
          id: item.id,
          material: item.material,
          quantity: String(item.quantity || ""),
          unit: item.unit || "metros",
          requiresLab: !!item.requires_lab,
          requiresFabricQuality: !!item.requires_fabric_quality,
          selectedFibers: fibers,
          tempId: crypto.randomUUID()
        };
      }));
      setView("new");
    } catch {
      alert("Erro ao carregar detalhes da OP");
    }
  };

  const handleReprint = async (op: ExistingPO) => {
    try {
      const opDetails = await get<CreatedPO>(`/production-orders/${op.id}`);
      setCreatedPO(opDetails);
    } catch {
      alert("Erro ao carregar OP para impressão");
    }
  };

  const handleDelete = async (op: ExistingPO) => {
    if (!confirm(`Tem certeza que deseja excluir a OP ${op.op_number}? Esta ação não pode ser desfeita.`)) return;
    try {
      await del(`/production-orders/${op.id}`);
      alert("OP excluída com sucesso");
      fetchExistingOPs();
    } catch {
      alert("Erro ao excluir OP");
    }
  };

  const handlePrint = () => window.print();

  const handleNewPO = () => {
    setCreatedPO(null);
    setEditingOP(null);
    setClient("");
    setColor("");
    setOrderNumber("");
    setDescription("");
    setEntryDate(new Date().toISOString().split('T')[0]);
    setExpectedDate(addBusinessDays(new Date(), 5).toISOString().split('T')[0]);
    setRegionJaragua(false);
    setRegionBrusque(false);
    setRegionGaspar(false);
    setItems([{
      material: "",
      quantity: "",
      unit: "metros",
      requiresLab: false,
      requiresFabricQuality: false,
      selectedFibers: [],
      tempId: crypto.randomUUID()
    }]);
    fetchNextOPNumber();
  };

  const filteredOPs = existingOPs.filter((op) =>
    op.op_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.color.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      almoxarifado: "Almoxarifado",
      qualidade_malhas: "Qualidade de Malhas",
      laboratorio: "Laboratório",
      preparacao: "Preparação",
      producao: "Produção",
      secadora: "Secadora",
      destrinchagem: "Destrinchagem",
      enrolagem: "Enrolagem",
      qualidade: "Qualidade",
      concluido: "Concluído",
    };
    return labels[status] || status;
  };

  // ─── FICHA DE IMPRESSÃO ───────────────────────────────────────────────────
  if (createdPO) {
    const horaAtual = format(new Date(), 'HH:mm');
    const diaRetorno = format(new Date(createdPO.expected_date), 'dd');

    return (
      <Layout>
        {/* Botões de ação - ocultos na impressão */}
        <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {editingOP ? "Ficha Atualizada" : "Ficha Gerada com Sucesso"}
            </h1>
            <p className="text-gray-500 text-sm mt-1">OP {createdPO.op_number} · {createdPO.items.length} item(ns)</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all">
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
            <button onClick={handleNewPO}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all">
              Nova Ficha
            </button>
          </div>
        </div>

        {/* CSS da ficha - injetado via style tag */}
        <style>{`
          @media print {
            body * { visibility: hidden !important; }
            #ficha-impressao, #ficha-impressao * { visibility: visible !important; }
            #ficha-impressao { position: fixed; top: 0; left: 0; width: 100%; }
            .print\\:hidden { display: none !important; }
            @page { size: A4 landscape; margin: 8mm; }
          }
          #ficha-impressao {
            font-family: Arial, Helvetica, sans-serif;
            background: white;
          }
          .f-wrap {
            width: 740px;
            border: 2px solid #000;
            margin: 0 auto;
          }
          /* ── CORPO PRINCIPAL ── */
          .f-body {
            display: flex;
            border-bottom: 2px solid #000;
          }
          /* Coluna esquerda larga */
          .f-col-left {
            width: 54%;
            border-right: 2px solid #000;
            display: flex;
            flex-direction: column;
          }
          .f-client {
            font-size: 36px;
            font-weight: 900;
            text-align: center;
            padding: 12px 8px;
            border-bottom: 1px solid #000;
            line-height: 1;
          }
          /* Área central: cor + imagem */
          .f-mid {
            display: flex;
            flex: 1;
            border-bottom: 1px solid #000;
          }
          .f-color {
            flex: 1;
            font-size: 30px;
            font-weight: 900;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 10px;
            border-right: 1px solid #000;
          }
          .f-img-box {
            width: 120px;
            min-height: 80px;
            border-left: none;
          }
          /* Especificações / materiais */
          .f-specs {
            font-size: 10.5px;
            font-weight: bold;
            padding: 6px 8px;
            min-height: 52px;
            line-height: 1.5;
          }
          /* Coluna direita estreita */
          .f-col-right {
            width: 46%;
            display: flex;
            flex-direction: column;
          }
          /* Tabela topo direita */
          .f-info-table {
            width: 100%;
            border-collapse: collapse;
          }
          .f-info-table td {
            border-bottom: 1px solid #000;
            font-size: 10.5px;
            font-weight: bold;
            padding: 3px 6px;
            height: 22px;
          }
          .f-lbl {
            width: 48%;
            background: #fff;
            font-weight: 900;
          }
          .f-val {
            text-align: right;
            width: 52%;
          }
          /* Número grande */
          .f-num-block {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            border-bottom: 1px solid #000;
            padding: 4px;
          }
          .f-big-num {
            font-size: 96px;
            font-weight: 900;
            line-height: 1;
          }
          /* Linha ESPECIFICAÇÕES */
          .f-spec-label {
            font-size: 10.5px;
            font-weight: 900;
            padding: 3px 6px;
            border-top: 1px solid #000;
          }
          /* ── RODAPÉ ── */
          .f-footer {
            display: flex;
            height: 105px;
          }
          .f-descricao {
            width: 50%;
            border-right: 1px solid #000;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            padding: 0 12px 6px;
          }
          .f-descricao-line {
            border-top: 1px solid #000;
            margin-bottom: 4px;
          }
          .f-descricao-title {
            font-size: 11px;
            font-weight: 900;
            text-align: center;
          }
          .f-checks {
            width: 50%;
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            padding: 8px 16px;
          }
          .f-check-row {
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .f-check-col {
            display: flex;
            flex-direction: column;
            gap: 3px;
          }
          .f-box {
            width: 15px;
            height: 15px;
            border: 1px solid #000;
            display: inline-block;
          }
          .f-check-lbl {
            font-size: 11px;
            font-weight: 900;
          }
        `}</style>

        {/* ── FICHA ── */}
        <div id="ficha-impressao">
          <div className="f-wrap">

            {/* CORPO */}
            <div className="f-body">

              {/* Coluna Esquerda */}
              <div className="f-col-left">
                <div className="f-client">{createdPO.client.toUpperCase()}</div>
                <div className="f-mid">
                  <div className="f-color">{createdPO.color.toUpperCase()}</div>
                  <div className="f-img-box" />
                </div>
                <div className="f-specs">
                  {createdPO.items.map((item, i) => (
                    <div key={i}>
                      {item.material.toUpperCase()} : {item.quantity}
                      {item.unit === 'metros' ? 'M' : item.unit === 'kg' ? 'KG' : 'UN'} OP- {item.individual_op}
                    </div>
                  ))}
                </div>
              </div>

              {/* Coluna Direita */}
              <div className="f-col-right">
                <table className="f-info-table">
                  <tbody>
                    <tr>
                      <td className="f-lbl">Nº PEDIDO</td>
                      <td className="f-val">{createdPO.order_number || ''}</td>
                    </tr>
                    <tr>
                      <td className="f-lbl">HORA</td>
                      <td className="f-val">{horaAtual}</td>
                    </tr>
                    <tr>
                      <td className="f-lbl">ENTRADA</td>
                      <td className="f-val">{format(new Date(createdPO.entry_date), 'dd/MM/yy')}</td>
                    </tr>
                    <tr>
                      <td className="f-lbl">RETORNO</td>
                      <td className="f-val">{format(new Date(createdPO.expected_date), 'dd/MM/yy')}</td>
                    </tr>
                    <tr>
                      <td className="f-lbl">CONF.</td>
                      <td className="f-val"></td>
                    </tr>
                  </tbody>
                </table>

                <div className="f-num-block">
                  <div className="f-big-num">{diaRetorno}</div>
                </div>

                <div className="f-spec-label">ESPECIFICAÇÕES</div>
              </div>
            </div>

            {/* RODAPÉ */}
            <div className="f-footer">
              <div className="f-descricao">
                <div className="f-descricao-line" />
                <div className="f-descricao-title">DESCRIÇÃO</div>
              </div>
              <div className="f-checks">
                <div className="f-check-row">
                  <div className="f-check-col">
                    <div className="f-box" />
                    <div className="f-box" />
                    <div className="f-box" />
                  </div>
                  <span className="f-check-lbl">SOLIDEZ</span>
                </div>
                <div className="f-check-row">
                  <div className="f-check-col">
                    <div className="f-box" />
                    <div className="f-box" />
                  </div>
                  <span className="f-check-lbl">APROVAÇÃO</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-4 print:hidden">Use Ctrl+P para imprimir · {createdPO.items.length} item(ns)</p>
      </Layout>
    );
  }

  // ─── FORMULÁRIO ──────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Almoxarifado</h1>
          <p className="text-gray-600">Gerenciar fichas de produção</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2">
          <div className="flex gap-2">
            <button
              onClick={() => { setView("new"); if (editingOP) handleNewPO(); }}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                view === "new" ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <FilePlus className="w-5 h-5" />
              {editingOP ? "Editar Ficha" : "Nova Ficha"}
            </button>
            <button
              onClick={() => setView("manage")}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                view === "manage" ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Search className="w-5 h-5" />
              Gerenciar Fichas
            </button>
          </div>
        </div>

        {view === "manage" ? (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por OP, cliente ou cor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">OP</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cor</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Previsão</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredOPs.length > 0 ? (
                      filteredOPs.map((op) => (
                        <tr key={op.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-semibold text-blue-600">{op.op_number}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">{op.client}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">{op.color}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                              {getStatusLabel(op.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {format(new Date(op.expected_date), "dd/MM/yyyy")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleEdit(op)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleReprint(op)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Reimprimir">
                                <Printer className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete(op)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Excluir">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Nenhuma ficha encontrada</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <PackagePlus className="w-6 h-6 mr-2 text-blue-600" />
                Informações Básicas
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cliente *</label>
                  <input type="text" value={client} onChange={(e) => setClient(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                    placeholder="Nome do cliente" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cor *</label>
                  <input type="text" value={color} onChange={(e) => setColor(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                    placeholder="Nome da cor" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nº Pedido</label>
                  <input type="text" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                    placeholder="Número do pedido" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Data de Entrada *</label>
                  <input type="date" value={entryDate} onChange={(e) => handleEntryDateChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Previsão de Saída *</label>
                  <input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Regiões Importantes</label>
                  <div className="flex gap-4 items-center h-[50px] px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg">
                    {[{label:'Jaraguá', val: regionJaragua, set: setRegionJaragua},
                      {label:'Brusque', val: regionBrusque, set: setRegionBrusque},
                      {label:'Gaspar',  val: regionGaspar,  set: setRegionGaspar}].map(r => (
                      <label key={r.label} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={r.val} onChange={(e) => r.set(e.target.checked)}
                          className="w-5 h-5 text-orange-600 border-orange-300 rounded" />
                        <span className="text-sm font-semibold text-orange-700">{r.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                  rows={3} placeholder="Informações adicionais..." />
              </div>
            </div>

            {/* Itens da produção */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Itens da Produção</h2>
                <button type="button" onClick={addItem}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-md">
                  <Plus className="w-5 h-5" />
                  Adicionar Item
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.tempId} className="p-4 border-2 border-gray-200 rounded-xl bg-gray-50">

                    {/* Linha 1: material, qtd, unidade, OP, remover */}
                    <div className="grid grid-cols-12 gap-3 mb-3">
                      <div className="col-span-5">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Material *</label>
                        <input type="text" value={item.material}
                          onChange={(e) => updateItem(item.tempId, "material", e.target.value.toUpperCase())}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase"
                          placeholder="Ex: ELÁSTICO 10-20MM" required />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Qtd *</label>
                        <input type="number" step="0.01" value={item.quantity}
                          onChange={(e) => updateItem(item.tempId, "quantity", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="100" required />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Un *</label>
                        <select value={item.unit} onChange={(e) => updateItem(item.tempId, "unit", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                          <option value="metros">m</option>
                          <option value="unidades">un</option>
                          <option value="kg">kg</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">OP</label>
                        <div className="px-2 py-2 border border-gray-200 rounded-lg bg-blue-50 text-sm text-blue-700 font-semibold text-center">
                          {editingOP
                            ? existingOPs.find(o => o.id === editingOP)?.op_number || ""
                            : getItemOPNumber(index)}
                        </div>
                      </div>
                      <div className="col-span-1 flex items-end">
                        <button type="button" onClick={() => removeItem(item.tempId)} disabled={items.length === 1}
                          className="w-full p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg disabled:opacity-40">
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </div>
                    </div>

                    {/* Linha 2: Lab, Malha e Fibras em linha separada */}
                    <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-200">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={item.requiresLab}
                          onChange={(e) => updateItem(item.tempId, "requiresLab", e.target.checked)}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded" />
                        <span className="text-xs font-semibold text-purple-700">Laboratório</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={item.requiresFabricQuality}
                          onChange={(e) => updateItem(item.tempId, "requiresFabricQuality", e.target.checked)}
                          className="w-4 h-4 text-teal-600 border-gray-300 rounded" />
                        <span className="text-xs font-semibold text-teal-700">Qualidade de Malha</span>
                      </label>

                      {/* Separador */}
                      <div className="h-4 w-px bg-gray-300" />

                      {/* Fibras */}
                      <span className="text-xs font-semibold text-gray-500">Fibras (máx 2):</span>
                      {fibras.length === 0 ? (
                        <span className="text-xs text-gray-400 italic">Carregando...</span>
                      ) : (
                        fibras.map((fibra) => {
                          const isSelected = item.selectedFibers.includes(fibra.id);
                          const isDisabled = !isSelected && item.selectedFibers.length >= 2;
                          return (
                            <label key={fibra.id}
                              className={`flex items-center gap-1.5 cursor-pointer ${
                                isDisabled ? 'opacity-40 cursor-not-allowed' : ''
                              }`}>
                              <input type="checkbox" checked={isSelected} disabled={isDisabled}
                                onChange={(e) => {
                                  const newFibers = e.target.checked
                                    ? [...item.selectedFibers, fibra.id]
                                    : item.selectedFibers.filter(id => id !== fibra.id);
                                  updateItem(item.tempId, "selectedFibers", newFibers);
                                }}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded" />
                              <span className="text-xs font-semibold text-indigo-700">{fibra.name}</span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              {editingOP && (
                <button type="button" onClick={handleNewPO}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-lg font-semibold text-lg">
                  Cancelar
                </button>
              )}
              <button type="submit" disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg disabled:opacity-50">
                {loading ? "Processando..." : editingOP ? "Atualizar Ficha" : "Gerar Ficha de Produção"}
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}
