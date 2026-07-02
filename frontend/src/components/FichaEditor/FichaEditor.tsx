import React, { useState, useRef, useCallback } from 'react'

type BlockType = 'text' | 'box' | 'line-h' | 'line-v' | 'dynamic'

interface Block {
  id: string
  type: BlockType
  x: number
  y: number
  w: number
  h: number
  content: string
  fontSize: number
  fontWeight: 'normal' | 'bold'
  align: 'left' | 'center' | 'right'
  border: boolean
  color: string
}

// Canvas em proporção A4 paisagem (297x210mm ≈ 842x595pt)
const CANVAS_W = 840
const CANVAS_H = 420

const DYNAMIC_FIELDS = [
  '{{cliente}}', '{{cor}}', '{{noPedido}}',
  '{{hora}}', '{{entrada}}', '{{retorno}}',
  '{{materiais}}', '{{numero}}'
]

// ─────────────────────────────────────────────────────────────
// Layout fiel à ficha física
// Lado esquerdo (0-440px): cliente | cor | materiais | descrição
// Lado direito (450-840px): número OP | pedido/hora/amido | solidez/aprovação
// ─────────────────────────────────────────────────────────────
const INITIAL_BLOCKS: Block[] = [
  // ── LADO ESQUERDO ──────────────────────────────────────────
  // Cliente — container superior, 28px bold centrado
  { id: 'b1',  type: 'dynamic', x: 0,   y: 0,   w: 440, h: 130, content: '{{cliente}}',  fontSize: 28, fontWeight: 'bold',   align: 'center', border: true, color: '#000' },
  // Cor — container do meio, 28px bold centrado
  { id: 'b2',  type: 'dynamic', x: 0,   y: 130, w: 440, h: 130, content: '{{cor}}',      fontSize: 28, fontWeight: 'bold',   align: 'center', border: true, color: '#000' },
  // Materiais — container inferior esquerdo
  { id: 'b3',  type: 'dynamic', x: 0,   y: 260, w: 440, h: 110, content: '{{materiais}}',fontSize: 11, fontWeight: 'normal', align: 'left',   border: true, color: '#000' },
  // Rodapé — Descrição (label colado na linha)
  { id: 'b4',  type: 'text',    x: 0,   y: 370, w: 110, h: 50,  content: 'Descrição',    fontSize: 9,  fontWeight: 'bold',   align: 'center', border: true, color: '#000' },
  // Solidez
  { id: 'b5',  type: 'text',    x: 110, y: 370, w: 165, h: 25,  content: 'SOLIDEZ',      fontSize: 9,  fontWeight: 'bold',   align: 'left',   border: true, color: '#000' },
  // Aprovação
  { id: 'b6',  type: 'text',    x: 110, y: 395, w: 165, h: 25,  content: 'APROVAÇÃO',    fontSize: 9,  fontWeight: 'bold',   align: 'left',   border: true, color: '#000' },
  // Área vazia ao lado de Solidez/Aprovação (assinatura)
  { id: 'b6b', type: 'box',     x: 275, y: 370, w: 165, h: 50,  content: '',             fontSize: 9,  fontWeight: 'normal', align: 'left',   border: true, color: '#000' },

  // ── DIVISOR VERTICAL ──────────────────────────────────────
  { id: 'div', type: 'line-v',  x: 440, y: 0,   w: 2,   h: 420, content: '',             fontSize: 9,  fontWeight: 'normal', align: 'left',   border: false, color: '#000' },

  // ── LADO DIREITO ───────────────────────────────────────────
  // Número OP — grande, topo direito
  { id: 'b7',  type: 'dynamic', x: 442, y: 0,   w: 398, h: 130, content: '{{numero}}',   fontSize: 90, fontWeight: 'bold',   align: 'center', border: true, color: '#000' },
  // Nº PEDIDO label
  { id: 'b8',  type: 'text',    x: 442, y: 130, w: 120, h: 40,  content: 'Nº PEDIDO',     fontSize: 9,  fontWeight: 'bold',   align: 'center', border: true, color: '#000' },
  // Nº PEDIDO valor
  { id: 'b9',  type: 'dynamic', x: 562, y: 130, w: 278, h: 40,  content: '{{noPedido}}', fontSize: 12, fontWeight: 'normal', align: 'left',   border: true, color: '#000' },
  // HORA label
  { id: 'b10', type: 'text',    x: 442, y: 170, w: 120, h: 40,  content: 'HORA',         fontSize: 9,  fontWeight: 'bold',   align: 'center', border: true, color: '#000' },
  // HORA valor
  { id: 'b11', type: 'dynamic', x: 562, y: 170, w: 278, h: 40,  content: '{{hora}}',     fontSize: 12, fontWeight: 'normal', align: 'left',   border: true, color: '#000' },
  // AMIDO título
  { id: 'b12', type: 'text',    x: 442, y: 210, w: 398, h: 35,  content: 'AMIDO',        fontSize: 10, fontWeight: 'bold',   align: 'center', border: true, color: '#000' },
  // AMIDO SIM
  { id: 'b13', type: 'text',    x: 442, y: 245, w: 199, h: 40,  content: '☐ SIM',         fontSize: 12, fontWeight: 'bold',   align: 'center', border: true, color: '#000' },
  // AMIDO NÃO
  { id: 'b14', type: 'text',    x: 641, y: 245, w: 199, h: 40,  content: '☐ NÃO',         fontSize: 12, fontWeight: 'bold',   align: 'center', border: true, color: '#000' },
  // Rodapé direito — SOLIDEZ label
  { id: 'b15', type: 'text',    x: 442, y: 370, w: 199, h: 25,  content: 'SOLIDEZ',      fontSize: 9,  fontWeight: 'bold',   align: 'left',   border: true, color: '#000' },
  // Rodapé direito — SOLIDEZ assinatura
  { id: 'b16', type: 'box',     x: 641, y: 370, w: 199, h: 25,  content: '',             fontSize: 9,  fontWeight: 'normal', align: 'left',   border: true, color: '#000' },
  // Rodapé direito — APROVAÇÃO label
  { id: 'b17', type: 'text',    x: 442, y: 395, w: 199, h: 25,  content: 'APROVAÇÃO',   fontSize: 9,  fontWeight: 'bold',   align: 'left',   border: true, color: '#000' },
  // Rodapé direito — APROVAÇÃO assinatura
  { id: 'b18', type: 'box',     x: 641, y: 395, w: 199, h: 25,  content: '',             fontSize: 9,  fontWeight: 'normal', align: 'left',   border: true, color: '#000' },
]

const FichaEditor: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>(INITIAL_BLOCKS)
  const [selected, setSelected] = useState<string | null>(null)
  const [dragging, setDragging] = useState<{ id: string; ox: number; oy: number } | null>(null)
  const [resizing, setResizing] = useState<{ id: string; ox: number; oy: number; ow: number; oh: number } | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const selectedBlock = blocks.find(b => b.id === selected) ?? null

  const addBlock = (type: BlockType, content = '') => {
    const id = 'b' + Date.now()
    setBlocks(prev => [...prev, {
      id, type,
      x: 50, y: 50, w: 160, h: 50,
      content: content || (type === 'dynamic' ? '{{campo}}' : type === 'line-h' || type === 'line-v' ? '' : 'Texto'),
      fontSize: 12, fontWeight: 'normal', align: 'left',
      border: type !== 'line-h' && type !== 'line-v',
      color: '#000',
    }])
    setSelected(id)
  }

  const onMouseDownBlock = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setSelected(id)
    const rect = canvasRef.current!.getBoundingClientRect()
    const block = blocks.find(b => b.id === id)!
    setDragging({ id, ox: e.clientX - rect.left - block.x, oy: e.clientY - rect.top - block.y })
  }

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    if (dragging) {
      setBlocks(prev => prev.map(b => b.id === dragging.id ? {
        ...b,
        x: Math.max(0, e.clientX - rect.left - dragging.ox),
        y: Math.max(0, e.clientY - rect.top - dragging.oy),
      } : b))
    }
    if (resizing) {
      setBlocks(prev => prev.map(b => b.id === resizing.id ? {
        ...b,
        w: Math.max(40, e.clientX - rect.left - resizing.ox + resizing.ow),
        h: Math.max(20, e.clientY - rect.top - resizing.oy + resizing.oh),
      } : b))
    }
  }, [dragging, resizing])

  const onMouseUp = () => { setDragging(null); setResizing(null) }

  const onMouseDownResize = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const rect = canvasRef.current!.getBoundingClientRect()
    const block = blocks.find(b => b.id === id)!
    setResizing({ id, ox: e.clientX - rect.left, oy: e.clientY - rect.top, ow: block.w, oh: block.h })
  }

  const updateBlock = (prop: keyof Block, val: any) => {
    if (!selected) return
    setBlocks(prev => prev.map(b => b.id === selected ? { ...b, [prop]: val } : b))
  }

  const deleteSelected = () => {
    if (!selected) return
    setBlocks(prev => prev.filter(b => b.id !== selected))
    setSelected(null)
  }

  const resetLayout = () => {
    if (confirm('Resetar para o layout padrão da ficha?')) {
      setBlocks(INITIAL_BLOCKS)
      setSelected(null)
    }
  }

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(blocks, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'ficha-layout.json'; a.click()
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif', background: '#f0f0f0' }}>

      {/* TOOLBAR ESQUERDA */}
      <div style={{ width: 200, background: '#1e1e2e', color: '#fff', padding: 16, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
        <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#cba6f7' }}>🎨 Ficha Editor</div>

        <div style={{ fontSize: 11, color: '#888', marginTop: 8 }}>ADICIONAR</div>
        <button onClick={() => addBlock('text')}   style={btnStyle}>📝 Texto</button>
        <button onClick={() => addBlock('box')}    style={btnStyle}>⬜ Caixa</button>
        <button onClick={() => addBlock('line-h')} style={btnStyle}>― Linha H</button>
        <button onClick={() => addBlock('line-v')} style={btnStyle}>| Linha V</button>

        <div style={{ fontSize: 11, color: '#888', marginTop: 12 }}>CAMPOS DINÂMICOS</div>
        {DYNAMIC_FIELDS.map(f => (
          <button key={f} onClick={() => addBlock('dynamic', f)} style={dynBtnStyle}>{f}</button>
        ))}

        <div style={{ flex: 1 }} />
        <button onClick={resetLayout} style={{ ...btnStyle, background: '#f9e2af', color: '#000', marginTop: 8 }}>🔄 Reset Layout</button>
        <button onClick={exportJSON}  style={{ background: '#a6e3a1', color: '#000', border: 'none', padding: '10px', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', fontSize: 12 }}>💾 Exportar JSON</button>
      </div>

      {/* CANVAS */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, overflow: 'auto' }}>
        <div style={{ marginBottom: 8, color: '#555', fontSize: 11 }}>
          Clique num bloco para selecionar • Arraste para mover • ↘ para redimensionar
        </div>
        <div
          ref={canvasRef}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onClick={() => setSelected(null)}
          style={{
            position: 'relative',
            width: CANVAS_W,
            height: CANVAS_H,
            background: '#fff',
            boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
            cursor: dragging ? 'grabbing' : 'default',
            flexShrink: 0,
          }}
        >
          {blocks.map(block => (
            <div
              key={block.id}
              onMouseDown={e => onMouseDownBlock(e, block.id)}
              style={{
                position: 'absolute',
                left: block.x, top: block.y, width: block.w, height: block.h,
                border: block.border ? '1px solid #000' : 'none',
                borderLeft:  block.type === 'line-v' ? '2px solid #000' : undefined,
                borderTop:   block.type === 'line-h' ? '2px solid #000' : undefined,
                boxSizing: 'border-box',
                cursor: 'grab',
                outline: selected === block.id ? '2px solid #89b4fa' : 'none',
                outlineOffset: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: block.align === 'center' ? 'center' : block.align === 'right' ? 'flex-end' : 'flex-start',
                padding: (block.type === 'line-h' || block.type === 'line-v') ? 0 : '2px 6px',
                userSelect: 'none',
                background: block.type === 'dynamic' ? 'rgba(137,180,250,0.07)' : 'transparent',
              }}
            >
              {block.type !== 'line-h' && block.type !== 'line-v' && (
                <span style={{
                  fontSize: block.fontSize,
                  fontWeight: block.fontWeight,
                  color: block.color,
                  whiteSpace: 'pre-wrap',
                  overflow: 'hidden',
                  maxWidth: '100%',
                  lineHeight: 1.2,
                }}>
                  {block.content}
                </span>
              )}
              {selected === block.id && (
                <div
                  onMouseDown={e => onMouseDownResize(e, block.id)}
                  style={{ position: 'absolute', right: 0, bottom: 0, width: 10, height: 10, background: '#89b4fa', cursor: 'nwse-resize' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* PAINEL DIREITO */}
      <div style={{ width: 220, background: '#1e1e2e', color: '#cdd6f4', padding: 16, overflowY: 'auto' }}>
        {selectedBlock ? (
          <>
            <div style={{ fontSize: 13, fontWeight: 'bold', color: '#cba6f7', marginBottom: 12 }}>✏️ Propriedades</div>

            <label style={labelStyle}>Conteúdo</label>
            <input value={selectedBlock.content} onChange={e => updateBlock('content', e.target.value)} style={inputStyle} />

            <label style={labelStyle}>Fonte (px)</label>
            <input type="number" value={selectedBlock.fontSize} onChange={e => updateBlock('fontSize', +e.target.value)} style={inputStyle} />

            <label style={labelStyle}>Peso</label>
            <select value={selectedBlock.fontWeight} onChange={e => updateBlock('fontWeight', e.target.value)} style={inputStyle}>
              <option value="normal">Normal</option>
              <option value="bold">Negrito</option>
            </select>

            <label style={labelStyle}>Alinhamento</label>
            <select value={selectedBlock.align} onChange={e => updateBlock('align', e.target.value)} style={inputStyle}>
              <option value="left">Esquerda</option>
              <option value="center">Centro</option>
              <option value="right">Direita</option>
            </select>

            <label style={labelStyle}>X / Y</label>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              <input type="number" value={selectedBlock.x} onChange={e => updateBlock('x', +e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
              <input type="number" value={selectedBlock.y} onChange={e => updateBlock('y', +e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
            </div>

            <label style={labelStyle}>W / H</label>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              <input type="number" value={selectedBlock.w} onChange={e => updateBlock('w', +e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
              <input type="number" value={selectedBlock.h} onChange={e => updateBlock('h', +e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, marginBottom: 12 }}>
              <input type="checkbox" checked={selectedBlock.border} onChange={e => updateBlock('border', e.target.checked)} />
              Borda
            </label>

            <button onClick={deleteSelected} style={{ width: '100%', background: '#f38ba8', color: '#000', border: 'none', padding: 8, borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', fontSize: 12 }}>🗑️ Deletar bloco</button>
          </>
        ) : (
          <div style={{ color: '#555', fontSize: 12, marginTop: 40, textAlign: 'center' }}>Clique em um bloco para editar suas propriedades</div>
        )}
      </div>
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  background: '#313244', color: '#cdd6f4', border: 'none',
  padding: '8px 12px', borderRadius: 6, cursor: 'pointer', textAlign: 'left', fontSize: 12,
}
const dynBtnStyle: React.CSSProperties = {
  background: '#1e3a5f', color: '#89b4fa', border: 'none',
  padding: '6px 10px', borderRadius: 6, cursor: 'pointer', textAlign: 'left', fontSize: 11,
}
const labelStyle: React.CSSProperties = { fontSize: 11, color: '#888', display: 'block', marginBottom: 2 }
const inputStyle: React.CSSProperties = {
  width: '100%', background: '#313244', border: 'none', color: '#fff',
  padding: 6, borderRadius: 4, marginBottom: 10, fontSize: 12, boxSizing: 'border-box',
}

export default FichaEditor
