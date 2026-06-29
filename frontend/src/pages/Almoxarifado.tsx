import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Plus, Trash2, PackagePlus, Printer, Search, Edit2, FilePlus } from "lucide-react";
import { useAPI } from "@/hooks/useAPI";
import { format, addBusinessDays, isValid } from "date-fns";

interface Fibra { id: number; name: string; }
interface Item {
  id?: number; material: string; quantity: string;
  unit: "metros" | "unidades" | "kg";
  requiresLab: boolean; requiresFabricQuality: boolean;
  selectedFibers: number[]; tempId: string;
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

const safeDate = (d: unknown): Date => {
  if (!d) return new Date();
  if (d instanceof Date) return isValid(d) ? d : new Date();
  const s = String(d).trim();
  if (!s) return new Date();
  const a = new Date(s); if (isValid(a)) return a;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) { const b = new Date(s + 'T12:00:00'); if (isValid(b)) return b; }
  return new Date();
};
const fmt = (d: unknown, mask = 'dd/MM/yy') => { try { return format(safeDate(d), mask); } catch { return ''; } };

export default function Almoxarifado() {
  const { get, post, put, del } = useAPI();
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'new'|'manage'>('new');
  const [searchTerm, setSearchTerm] = useState('');
  const [existingOPs, setExistingOPs] = useState<ExistingPO[]>([]);
  const [editingOP, setEditingOP] = useState<number|null>(null);
  const [client, setClient] = useState('');
  const [color, setColor] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [description, setDescription] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedDate, setExpectedDate] = useState(addBusinessDays(new Date(),5).toISOString().split('T')[0]);
  const [regionJaragua, setRegionJaragua] = useState(false);
  const [regionBrusque, setRegionBrusque] = useState(false);
  const [regionGaspar, setRegionGaspar] = useState(false);
  const [fibras, setFibras] = useState<Fibra[]>([]);
  const [items, setItems] = useState<Item[]>([{material:'',quantity:'',unit:'metros',requiresLab:false,requiresFabricQuality:false,selectedFibers:[],tempId:crypto.randomUUID()}]);
  const [createdPO, setCreatedPO] = useState<CreatedPO|null>(null);
  const [nextOPNumber, setNextOPNumber] = useState('001');

  const handleEntryDateChange = (v: string) => {
    setEntryDate(v);
    setExpectedDate(addBusinessDays(new Date(v+'T12:00:00'),5).toISOString().split('T')[0]);
  };

  useEffect(()=>{fetchNextOPNumber();fetchFibras();},[]);
  useEffect(()=>{if(view==='manage')fetchExistingOPs();},[view]);

  const fetchFibras = async()=>{try{setFibras(await get<Fibra[]>('/fibras'));}catch{}};
  const fetchNextOPNumber = async()=>{try{const r=await get<{next_op_number:string}>('/production-orders/next-op-number');setNextOPNumber(r.next_op_number);}catch{}};
  const fetchExistingOPs = async()=>{try{setExistingOPs(await get<ExistingPO[]>('/production-orders'));}catch{}};
  const getItemOP = (i:number)=>String(parseInt(nextOPNumber)+i).padStart(3,'0');
  const addItem = ()=>setItems([...items,{material:'',quantity:'',unit:'metros',requiresLab:false,requiresFabricQuality:false,selectedFibers:[],tempId:crypto.randomUUID()}]);
  const removeItem = (t:string)=>{if(items.length>1)setItems(items.filter(i=>i.tempId!==t))};
  const updateItem = (t:string,f:keyof Item,v:unknown)=>setItems(items.map(i=>i.tempId===t?{...i,[f]:v}:i));

  const buildPayload = ()=>({
    client:client.toUpperCase(), color:color.toUpperCase(),
    order_number:orderNumber?orderNumber.toUpperCase():undefined,
    description:description?description.toUpperCase():undefined,
    entry_date:new Date(entryDate+'T12:00:00').toISOString(),
    expected_date:new Date(expectedDate+'T12:00:00').toISOString(),
    region_jaragua:regionJaragua, region_brusque:regionBrusque, region_gaspar:regionGaspar,
    items:items.map(it=>({material:it.material.toUpperCase(),quantity:parseFloat(it.quantity)||0,unit:it.unit,requires_lab:it.requiresLab,requires_fabric_quality:it.requiresFabricQuality,fiber_id:it.selectedFibers[0]||null,is_dual_fiber:it.selectedFibers.length>=2,fiber2_id:it.selectedFibers[1]||null})),
  });

  const handleSubmit = async(e:React.FormEvent)=>{
    e.preventDefault();
    if(!client||!color||items.some(i=>!i.material||!i.quantity)){alert('Preencha todos os campos obrigatórios');return;}
    setLoading(true);
    try{
      if(editingOP){await put(`/production-orders/${editingOP}`,buildPayload());setCreatedPO(await get<CreatedPO>(`/production-orders/${editingOP}`));setEditingOP(null);}
      else{const r=await post<{id:number}>('/production-orders',buildPayload());setCreatedPO(await get<CreatedPO>(`/production-orders/${r.id}`));}
    }catch{alert(editingOP?'Erro ao atualizar ficha':'Erro ao criar ficha');}finally{setLoading(false);}
  };

  const handleEdit = async(op:ExistingPO)=>{
    try{
      const d=await get<any>(`/production-orders/${op.id}`);
      setEditingOP(op.id);setClient(d.client);setColor(d.color);
      setOrderNumber(d.order_number||'');setDescription(d.description||'');
      setEntryDate(safeDate(d.entry_date).toISOString().split('T')[0]);
      setExpectedDate(safeDate(d.expected_date).toISOString().split('T')[0]);
      setRegionJaragua(!!d.region_jaragua);setRegionBrusque(!!d.region_brusque);setRegionGaspar(!!d.region_gaspar);
      setItems(d.items.map((it:any)=>{const f:number[]=[];if(it.fiber_id)f.push(it.fiber_id);if(it.fiber2_id)f.push(it.fiber2_id);return{id:it.id,material:it.material,quantity:String(it.quantity||''),unit:it.unit||'metros',requiresLab:!!it.requires_lab,requiresFabricQuality:!!it.requires_fabric_quality,selectedFibers:f,tempId:crypto.randomUUID()};}))
      setView('new');
    }catch{alert('Erro ao carregar OP');}
  };

  const handleReprint = async(op:ExistingPO)=>{try{setCreatedPO(await get<CreatedPO>(`/production-orders/${op.id}`));}catch{alert('Erro ao carregar OP');}};
  const handleDelete = async(op:ExistingPO)=>{
    if(!confirm(`Excluir OP ${op.op_number}?`))return;
    try{await del(`/production-orders/${op.id}`);alert('OP excluída');fetchExistingOPs();}catch{alert('Erro ao excluir');}
  };

  const handleNewPO = ()=>{
    setCreatedPO(null);setEditingOP(null);setClient('');setColor('');setOrderNumber('');setDescription('');
    setEntryDate(new Date().toISOString().split('T')[0]);
    setExpectedDate(addBusinessDays(new Date(),5).toISOString().split('T')[0]);
    setRegionJaragua(false);setRegionBrusque(false);setRegionGaspar(false);
    setItems([{material:'',quantity:'',unit:'metros',requiresLab:false,requiresFabricQuality:false,selectedFibers:[],tempId:crypto.randomUUID()}]);
    fetchNextOPNumber();
  };

  const filteredOPs = existingOPs.filter(op=>
    op.op_number.toLowerCase().includes(searchTerm.toLowerCase())||
    op.client.toLowerCase().includes(searchTerm.toLowerCase())||
    op.color.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusLabel = (s:string)=>(({almoxarifado:'Almoxarifado',qualidade_malhas:'Qualidade de Malhas',laboratorio:'Laboratório',preparacao:'Preparação',producao:'Produção',secadora:'Secadora',destrinchagem:'Destrinchagem',enrolagem:'Enrolagem',qualidade:'Qualidade',concluido:'Concluído'} as Record<string,string>)[s]||s);
  const unitLabel = (u:string)=>u==='metros'?'M':u==='kg'?'KG':'UN';

  /* ─────────────────────────────────────────
     FICHA — layout idêntico ao modelo original
     ───────────────────────────────────────── */
  if (createdPO) {
    const hora = format(new Date(),'HH:mm');
    const diaRet = (()=>{try{return format(safeDate(createdPO.expected_date),'dd');}catch{return '--';}})();

    return (
      <Layout>
        {/* barra de ações — some na impressão */}
        <div className="print:hidden" style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
          <div>
            <h1 style={{fontSize:20,fontWeight:700}}>Ficha — OP {createdPO.op_number}</h1>
            <p style={{color:'#666',fontSize:13}}>{(createdPO.items??[]).length} item(ns)</p>
          </div>
          <div style={{display:'flex',gap:10}}>
            <button onClick={()=>window.print()} style={{display:'flex',alignItems:'center',gap:6,background:'#1d4ed8',color:'#fff',border:'none',borderRadius:7,padding:'9px 20px',fontWeight:700,cursor:'pointer'}}>
              <Printer size={15}/> Imprimir
            </button>
            <button onClick={handleNewPO} style={{background:'#15803d',color:'#fff',border:'none',borderRadius:7,padding:'9px 20px',fontWeight:700,cursor:'pointer'}}>
              Nova Ficha
            </button>
          </div>
        </div>

        <style>{`
          @media print {
            nav,header,aside,.print-hide{display:none!important;}
            body{margin:0;background:#fff;}
            @page{size:A4 portrait;margin:6mm;}
          }

          /*
           * ESTRUTURA EXATA DA FICHA ORIGINAL:
           *
           * A ficha é dividida em 2 colunas principais:
           *   - Esquerda (≈62%): tudo exceto a tabela de info / número / especificações
           *   - Direita  (≈38%): tabela info + número grande + ESPECIFICAÇÕES (coluna contínua)
           *
           * Dentro da coluna ESQUERDA:
           *   Linha 1: NOME CLIENTE (altura pequena)
           *   Linha 2: [COR | espaço branco] (duas sub-colunas, altura grande)
           *   Linha 3: materiais (texto, largura total da esquerda)
           *   Linha 4: rodapé [DESCRIÇÃO | caixinhas SOLIDEZ/APROVAÇÃO]
           *
           * Dentro da coluna DIREITA (contínua, sem quebras horizontais próprias):
           *   - tabela: Nº PEDIDO / HORA / ENTRADA / RETORNO / CONF.
           *   - número enorme (dia do retorno)
           *   - ESPECIFICAÇÕES (label no fundo)
           */

          .ficha {
            font-family: Arial, Helvetica, sans-serif;
            width: 190mm;
            max-width: 100%;
            border: 2px solid #000;
            background: #fff;
            box-sizing: border-box;
            display: grid;
            /* 2 colunas principais */
            grid-template-columns: 62% 38%;
            grid-template-rows: auto;
          }

          /* ── COLUNA ESQUERDA: ocupa as 4 linhas ── */
          .ficha-esq {
            grid-column: 1;
            grid-row: 1;
            border-right: 2px solid #000;
            display: flex;
            flex-direction: column;
          }

          /* ── COLUNA DIREITA: ocupa 1 linha contínua ── */
          .ficha-dir {
            grid-column: 2;
            grid-row: 1;
            display: flex;
            flex-direction: column;
          }

          /* ━━━ ESQUERDA ━━━ */

          /* L1: NOME CLIENTE */
          .f-cliente {
            border-bottom: 2px solid #000;
            padding: 10px 14px;
            font-size: 30px;
            font-weight: 900;
            line-height: 1.1;
            min-height: 60px;
            display: flex;
            align-items: center;
          }

          /* L2: COR + espaço em branco ao lado */
          .f-cor-row {
            border-bottom: 2px solid #000;
            display: grid;
            grid-template-columns: 55% 45%;
            min-height: 130px;
          }
          .f-cor {
            border-right: 2px solid #000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 26px;
            font-weight: 900;
            padding: 10px 8px;
            text-align: center;
          }
          .f-cor-img {
            /* espaço em branco — reservado para imagem/amostra */
            background: #fff;
          }

          /* L3: materiais */
          .f-mat {
            border-bottom: 2px solid #000;
            padding: 8px 14px;
            font-size: 11px;
            font-weight: 700;
            line-height: 1.9;
            min-height: 80px;
          }

          /* L4: rodapé esquerdo — DESCRIÇÃO + SOLIDEZ/APROVAÇÃO */
          .f-rodape {
            display: grid;
            grid-template-columns: 50% 50%;
            min-height: 100px;
          }
          .f-desc {
            border-right: 2px solid #000;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            padding: 0 14px 6px;
          }
          .f-desc-line { border-top: 1.5px solid #000; margin-bottom: 4px; }
          .f-desc-label { text-align: center; font-size: 11px; font-weight: 900; }

          .f-checks {
            display: flex;
            flex-direction: column;
            justify-content: space-evenly;
            padding: 8px 16px;
          }
          .f-chk-bloco { display: flex; align-items: center; gap: 8px; }
          .f-boxes { display: flex; flex-direction: column; gap: 3px; }
          .f-box {
            width: 14px;
            height: 14px;
            border: 1.5px solid #000;
          }
          .f-chk-label { font-size: 11px; font-weight: 900; }

          /* ━━━ DIREITA ━━━ */

          /* tabela info */
          .f-info-table {
            width: 100%;
            border-collapse: collapse;
            border-bottom: 2px solid #000;
          }
          .f-info-table td {
            padding: 5px 8px;
            font-size: 11px;
            font-weight: 800;
            border-bottom: 1.5px solid #000;
            white-space: nowrap;
          }
          .f-info-table tr:last-child td { border-bottom: none; }
          .f-info-table td.lbl { border-right: 1.5px solid #000; width: 52%; }
          .f-info-table td.val { text-align: right; }

          /* número grande */
          .f-numero {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            border-bottom: 2px solid #000;
            padding: 8px 0;
          }
          .f-numero span {
            font-size: 110px;
            font-weight: 900;
            line-height: 1;
            letter-spacing: -4px;
          }

          /* ESPECIFICAÇÕES */
          .f-esp {
            padding: 6px 8px;
            font-size: 11px;
            font-weight: 900;
          }
        `}</style>

        {/* ─── FICHA ─── */}
        <div className="ficha">

          {/* COLUNA ESQUERDA */}
          <div className="ficha-esq">

            {/* L1 — cliente */}
            <div className="f-cliente">{createdPO.client?.toUpperCase()??''}</div>

            {/* L2 — cor + espaço branco */}
            <div className="f-cor-row">
              <div className="f-cor">{createdPO.color?.toUpperCase()??''}</div>
              <div className="f-cor-img"/>
            </div>

            {/* L3 — materiais */}
            <div className="f-mat">
              {(createdPO.items??[]).map((it,i)=>(
                <div key={i}>
                  {it.material?.toUpperCase()??''}: {it.quantity??''}{unitLabel(it.unit??'metros')} OP- {it.individual_op??''}
                </div>
              ))}
            </div>

            {/* L4 — rodapé */}
            <div className="f-rodape">
              <div className="f-desc">
                <div className="f-desc-line"/>
                <div className="f-desc-label">DESCRIÇÃO</div>
              </div>
              <div className="f-checks">
                <div className="f-chk-bloco">
                  <div className="f-boxes">
                    <div className="f-box"/>
                    <div className="f-box"/>
                    <div className="f-box"/>
                  </div>
                  <span className="f-chk-label">SOLIDEZ</span>
                </div>
                <div className="f-chk-bloco">
                  <div className="f-boxes">
                    <div className="f-box"/>
                    <div className="f-box"/>
                  </div>
                  <span className="f-chk-label">APROVAÇÃO</span>
                </div>
              </div>
            </div>

          </div>{/* fim esquerda */}

          {/* COLUNA DIREITA */}
          <div className="ficha-dir">

            {/* tabela info */}
            <table className="f-info-table">
              <tbody>
                <tr><td className="lbl">Nº PEDIDO</td><td className="val">{createdPO.order_number??''}</td></tr>
                <tr><td className="lbl">HORA</td><td className="val">{hora}</td></tr>
                <tr><td className="lbl">ENTRADA</td><td className="val">{fmt(createdPO.entry_date)}</td></tr>
                <tr><td className="lbl">RETORNO</td><td className="val">{fmt(createdPO.expected_date)}</td></tr>
                <tr><td className="lbl">CONF.</td><td className="val"></td></tr>
              </tbody>
            </table>

            {/* número grande */}
            <div className="f-numero">
              <span>{diaRet}</span>
            </div>

            {/* ESPECIFICAÇÕES */}
            <div className="f-esp">ESPECIFICAÇÕES</div>

          </div>{/* fim direita */}

        </div>{/* fim ficha */}

        <p className="print:hidden" style={{textAlign:'center',color:'#aaa',fontSize:13,marginTop:12}}>Ctrl+P para imprimir</p>
      </Layout>
    );
  }

  /* ─────────────────────────────────────────
     FORMULÁRIO
     ───────────────────────────────────────── */
  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Almoxarifado</h1>
          <p className="text-gray-600">Gerenciar fichas de produção</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2">
          <div className="flex gap-2">
            <button onClick={()=>setView('new')} className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${view==='new'?'bg-blue-500 text-white shadow-lg':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <FilePlus className="w-5 h-5"/> {editingOP?'Editar Ficha':'Nova Ficha'}
            </button>
            <button onClick={()=>setView('manage')} className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${view==='manage'?'bg-blue-500 text-white shadow-lg':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <Search className="w-5 h-5"/> Gerenciar Fichas
            </button>
          </div>
        </div>

        {view==='manage' ? (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                <input type="text" placeholder="Buscar por OP, cliente ou cor..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"/>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>{['OP','Cliente','Cor','Status','Previsão','Ações'].map(h=>(
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredOPs.length>0?filteredOPs.map(op=>(
                      <tr key={op.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold text-blue-600">{op.op_number}</td>
                        <td className="px-6 py-4">{op.client}</td>
                        <td className="px-6 py-4">{op.color}</td>
                        <td className="px-6 py-4"><span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{statusLabel(op.status)}</span></td>
                        <td className="px-6 py-4 text-sm text-gray-600">{fmt(op.expected_date,'dd/MM/yyyy')}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={()=>handleEdit(op)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4"/></button>
                            <button onClick={()=>handleReprint(op)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Printer className="w-4 h-4"/></button>
                            <button onClick={()=>handleDelete(op)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                          </div>
                        </td>
                      </tr>
                    )):(
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
                <PackagePlus className="w-6 h-6 mr-2 text-blue-600"/> Informações Básicas
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cliente *</label>
                  <input type="text" value={client} onChange={e=>setClient(e.target.value.toUpperCase())} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase" placeholder="Nome do cliente" required/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cor *</label>
                  <input type="text" value={color} onChange={e=>setColor(e.target.value.toUpperCase())} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase" placeholder="Nome da cor" required/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nº Pedido</label>
                  <input type="text" value={orderNumber} onChange={e=>setOrderNumber(e.target.value.toUpperCase())} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase" placeholder="Número do pedido"/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Data de Entrada *</label>
                  <input type="date" value={entryDate} onChange={e=>handleEntryDateChange(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Previsão de Saída *</label>
                  <input type="date" value={expectedDate} onChange={e=>setExpectedDate(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Regiões</label>
                  <div className="flex gap-4 items-center h-[50px] px-4 bg-orange-50 border border-orange-200 rounded-lg">
                    {([['Jaraguá',regionJaragua,setRegionJaragua],['Brusque',regionBrusque,setRegionBrusque],['Gaspar',regionGaspar,setRegionGaspar]] as const).map(([l,v,s])=>(
                      <label key={l as string} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={v as boolean} onChange={e=>(s as (x:boolean)=>void)(e.target.checked)} className="w-5 h-5 text-orange-600 rounded"/>
                        <span className="text-sm font-semibold text-orange-700">{l as string}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
                <textarea value={description} onChange={e=>setDescription(e.target.value.toUpperCase())} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase" rows={3} placeholder="Informações adicionais..."/>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Itens da Produção</h2>
                <button type="button" onClick={addItem} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md">
                  <Plus className="w-5 h-5"/> Adicionar Item
                </button>
              </div>
              <div className="space-y-4">
                {items.map((item,index)=>(
                  <div key={item.tempId} className="p-4 border-2 border-gray-200 rounded-xl bg-gray-50">
                    <div className="grid grid-cols-12 gap-3 mb-3">
                      <div className="col-span-5">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Material *</label>
                        <input type="text" value={item.material} onChange={e=>updateItem(item.tempId,'material',e.target.value.toUpperCase())} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase" placeholder="Ex: ELÁSTICO 10-20MM" required/>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Qtd *</label>
                        <input type="number" step="0.01" value={item.quantity} onChange={e=>updateItem(item.tempId,'quantity',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="100" required/>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Un *</label>
                        <select value={item.unit} onChange={e=>updateItem(item.tempId,'unit',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                          <option value="metros">m</option>
                          <option value="unidades">un</option>
                          <option value="kg">kg</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">OP</label>
                        <div className="px-2 py-2 border border-gray-200 rounded-lg bg-blue-50 text-sm text-blue-700 font-semibold text-center">
                          {editingOP?existingOPs.find(o=>o.id===editingOP)?.op_number||'':getItemOP(index)}
                        </div>
                      </div>
                      <div className="col-span-1 flex items-end">
                        <button type="button" onClick={()=>removeItem(item.tempId)} disabled={items.length===1} className="w-full p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg disabled:opacity-40">
                          <Trash2 className="w-4 h-4 mx-auto"/>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-200">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={item.requiresLab} onChange={e=>updateItem(item.tempId,'requiresLab',e.target.checked)} className="w-4 h-4 text-purple-600 rounded"/>
                        <span className="text-xs font-semibold text-purple-700">Laboratório</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={item.requiresFabricQuality} onChange={e=>updateItem(item.tempId,'requiresFabricQuality',e.target.checked)} className="w-4 h-4 text-teal-600 rounded"/>
                        <span className="text-xs font-semibold text-teal-700">Qualidade de Malha</span>
                      </label>
                      <div className="h-4 w-px bg-gray-300"/>
                      <span className="text-xs font-semibold text-gray-500">Fibras (máx 2):</span>
                      {fibras.length===0?(
                        <span className="text-xs text-gray-400 italic">Carregando...</span>
                      ):fibras.map(fibra=>{
                        const sel=item.selectedFibers.includes(fibra.id);
                        const dis=!sel&&item.selectedFibers.length>=2;
                        return(
                          <label key={fibra.id} className={`flex items-center gap-1.5 cursor-pointer ${dis?'opacity-40 cursor-not-allowed':''}`}>
                            <input type="checkbox" checked={sel} disabled={dis}
                              onChange={e=>updateItem(item.tempId,'selectedFibers',e.target.checked?[...item.selectedFibers,fibra.id]:item.selectedFibers.filter(id=>id!==fibra.id))}
                              className="w-4 h-4 text-indigo-600 rounded"/>
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
              {editingOP&&(
                <button type="button" onClick={handleNewPO} className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-lg font-semibold text-lg">Cancelar</button>
              )}
              <button type="submit" disabled={loading} className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg disabled:opacity-50">
                {loading?'Processando...':editingOP?'Atualizar Ficha':'Gerar Ficha de Produção'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}
