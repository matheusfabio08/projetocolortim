import React, { useState, useRef, useCallback } from 'react'

// ─── Tipos ────────────────────────────────────────────
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

const CANVAS_W = 900
const CANVAS_H = 650

const DYNAMIC_FIELDS = [
  '{{cliente}}', '{{cor}}', '{{noPedido}}',
  '{{hora}}', '{{entrada}}', '{{retorno}}',
  '{{materiais}}', '{{numero}}'
]

const INITIAL_BLOCKS: Block[] = [
  { id: 'b1',  type: 'dynamic', x: 20,  y: 20,  w: 420, h: 100, content: '{{cliente}}',   fontSize: 28, fontWeight: 'bold',   align: 'center', border: true,  color: '#000' },
  { id: 'b2',  type: 'dynamic', x: 20,  y: 125, w: 420, h: 100, content: '{{cor}}',       fontSize: 28, fontWeight: 'bold',   align: 'center', border: true,  color: '#000' },
  { id: 'b3',  type: 'dynamic', x: 20,  y: 230, w: 420, h: 120, content: '{{materiais}}', fontSize: 11, fontWeight: 'normal', align: 'left',   border: true,  color: '#000' },
  { id: 'b4',  type: 'text',    x: 20,  y: 355, w: 100, h: 80,  content: 'Descrição',     fontSize: 9,  fontWeight: 'bold',   align: 'center', border: true,  color: '#000' },
  { id: 'b5',  type: 'text',    x: 125, y: 355, w: 120, h: 38,  content: 'SOLIDEZ',       fontSize: 9,  fontWeight: 'bold',   align: 'left',   border: true,  color: '#000' },
  { id: 'b6',  type: 'text',    x: 125, y: 393, w: 120, h: 42,  content: 'APROVAÇÃO',     fontSize: 9,  fontWeight: 'bold',   align: 'left',   border: true,  color: '#000' },
  { id: 'b7',  type: 'dynamic', x: 460, y: 20,  w: 220, h: 100, content: '{{numero}}',    fontSize: 80, fontWeight: 'bold',   align: 'center', border: true,  color: '#000' },
  { id: 'b8',  type: 'text',    x: 460, y: 125, w: 110, h: 30,  content: 'Nº PEDIDO',      fontSize: 8,  fontWeight: 'bold',   align: 'left',   border: true,  color: '#000' },
  { id: 'b9',  type: 'dynamic', x: 570, y: 125, w: 110, h: 30,  content: '{{noPedido}}',  fontSize: 9,  fontWeight: 'normal', align: 'left',   border: true,  color: '#000' },
  { id: 'b10', type: 'text',    x: 460, y: 158, w: 110, h: 30,  content: 'HORA',          fontSize: 8,  fontWeight: 'bold',   align: 'left',   border: true,  color: '#000' },
  { id: 'b11', type: 'dynamic', x: 570, y: 158, w: 110, h: 30,  content: '{{hora}}',      fontSize: 9,  fontWeight: 'normal', align: 'left',   border: true,  color: '#000' },
  { id: 'b12', type: 'text',    x: 460, y: 191, w: 220, h: 30,  content: 'AMIDO',         fontSize: 10, fontWeight: 'bold',   align: 'center', border: true,  color: '#000' },
  { id: 'b13', type: 'text',    x: 460, y: 224, w: 110, h: 30,  content: '☐ SIM',          fontSize: 9,  fontWeight: 'bold',   align: 'center', border: true,  color: '#000' },
  { id: 'b14', type: 'text',    x: 570, y: 224, w: 110, h: 30,  content: '☐ NÃO',          fontSize: 9,  fontWeight: 'bold',   align: 'center', border: true,  color: '#000' },
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
    const newBlock: Block = {
      id, type,
      x: 50, y: 50, w: 160, h: 50,
      content: content || (type === 'dynamic' ? '{{campo}}' : type === 'line-h' ? '' : 'Texto'),
      fontSize: 12, fontWeight: 'normal', align: 'left',
      border: type !== 'line-h' && type !== 'line-v',
      color: '#000',
    }
    setBlocks(prev => [...prev, newBlock])
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
      const nx = Math.max(0, e.clientX - rect.left - dragging.ox)
      const ny = Math.max(0, e.clientY - rect.top - dragging.oy)
      setBlocks(prev => prev.map(b => b.id === dragging.id ? { ...b, x: nx, y: ny } : b))
    }
    if (resizing) {
      const nw = Math.max(40, e.clientX - rect.left - resizing.ox + resizing.ow)
      const nh = Math.max(20, e.clientY - rect.top - resizing.oy + resizing.oh)
      setBlocks(prev => prev.map(b => b.id === resizing.id ? { ...b, w: nw, h: nh } : b))
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

  const exportJSON = () => {
    const json = JSON.stringify(blocks, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'ficha-layout.json'; a.click()
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif', background: '#f0f0f0' }}>

      {/* TOOLBAR ESQUERDA */}
      <div style={{ width: 200, background: '#1e1e2e', color: '#fff', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#cba6f7' }}>🎨 Ficha Editor</div>

        <div style={{ fontSize: 11, color: '#888', marginTop: 8 }}>ADICIONAR</div>
        <button onClick={() => addBlock('text')} style={{ background: '#313244', color: '#cdd6f4', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', textAlign: 'left', fontSize: 12 }}>📝 Texto</button>
        <button onClick={() => addBlock('box')} style={{ background: '#313244', color: '#cdd6f4', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', textAlign: 'left', fontSize: 12 }}>⬜ Caixa</button>
        <button onClick={() => addBlock('line-h')} style={{ background: '#313244', color: '#cdd6f4', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', textAlign: 'left', fontSize: 12 }}>― Linha H</button>

        <div style={{ fontSize: 11, color: '#888', marginTop: 12 }}>CAMPOS DINÂMICOS</div>
        {DYNAMIC_FIELDS.map(f => (
          <button key={f} onClick={() => addBlock('dynamic', f)} style={{
            background: '#1e3a5f', color: '#89b4fa', border: 'none',
            padding: '6px 10px', borderRadius: 6, cursor: 'pointer', textAlign: 'left', fontSize: 11
          }}>{f}</button>
        ))}

        <div style={{ flex: 1 }} />
        <button onClick={exportJSON} style={{
          background: '#a6e3a1', color: '#000', border: 'none',
          padding: '10px', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', fontSize: 12
        }}>💾 Exportar JSON</button>
      </div>

      {/* CANVAS */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24, overflow: 'auto' }}>
        <div style={{ marginBottom: 12, color: '#555', fontSize: 12 }}>
          Clique num bloco para selecionar • Arraste para mover • ↘ para redimensionar
        </div>
        <div
          ref={canvasRef}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onClick={() => setSelected(null)}
          style={{
            position: 'relative', width: CANVAS_W, height: CANVAS_H,
            background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            cursor: dragging ? 'grabbing' : 'default',
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
                borderTop: block.type === 'line-h' ? '2px solid #000' : undefined,
                boxSizing: 'border-box',
                cursor: 'grab',
                outline: selected === block.id ? '2px solid #89b4fa' : 'none',
                outlineOffset: 1,
                display: 'flex',
                alignItems: block.type === 'line-h' ? 'flex-start' : 'center',
                justifyContent: block.align === 'center' ? 'center' : block.align === 'right' ? 'flex-end' : 'flex-start',
                padding: block.type === 'line-h' ? 0 : '2px 4px',
                userSelect: 'none',
                background: block.type === 'dynamic' ? 'rgba(137,180,250,0.08)' : 'transparent',
              }}
            >
              {block.type !== 'line-h' && (
                <span style={{
                  fontSize: block.fontSize,
                  fontWeight: block.fontWeight,
                  color: block.color,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {block.content}
                </span>
              )}
              {selected === block.id && (
                <div
                  onMouseDown={e => onMouseDownResize(e, block.id)}
                  style={{
                    position: 'absolute', right: 0, bottom: 0,
                    width: 10, height: 10, background: '#89b4fa',
                    cursor: 'nwse-resize',
                  }}
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
            <div style={{ fontSize: 13, fontWeight: 'bold', color: '#cba6f7', marginBottom: 12 }}>
              ✏️ Propriedades
            </div>

            <label style={{ fontSize: 11, color: '#888' }}>Conteúdo</label>
            <input value={selectedBlock.content} onChange={e => updateBlock('content', e.target.value)}
              style={{ width: '100%', background: '#313244', border: 'none', color: '#fff', padding: 6, borderRadius: 4, marginBottom: 10, fontSize: 12 }} />

            <label style={{ fontSize: 11, color: '#888' }}>Fonte (px)</label>
            <input type="number" value={selectedBlock.fontSize} onChange={e => updateBlock('fontSize', +e.target.value)}
              style={{ width: '100%', background: '#313244', border: 'none', color: '#fff', padding: 6, borderRadius: 4, marginBottom: 10, fontSize: 12 }} />

            <label style={{ fontSize: 11, color: '#888' }}>Peso</label>
            <select value={selectedBlock.fontWeight} onChange={e => updateBlock('fontWeight', e.target.value)}
              style={{ width: '100%', background: '#313244', border: 'none', color: '#fff', padding: 6, borderRadius: 4, marginBottom: 10, fontSize: 12 }}>
              <option value="normal">Normal</option>
              <option value="bold">Negrito</option>
            </select>

            <label style={{ fontSize: 11, color: '#888' }}>Alinhamento</label>
            <select value={selectedBlock.align} onChange={e => updateBlock('align', e.target.value)}
              style={{ width: '100%', background: '#313244', border: 'none', color: '#fff', padding: 6, borderRadius: 4, marginBottom: 10, fontSize: 12 }}>
              <option value="left">Esquerda</option>
              <option value="center">Centro</option>
              <option value="right">Direita</option>
            </select>

            <label style={{ fontSize: 11, color: '#888' }}>X / Y</label>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              <input type="number" value={selectedBlock.x} onChange={e => updateBlock('x', +e.target.value)}
                style={{ width: '50%', background: '#313244', border: 'none', color: '#fff', padding: 6, borderRadius: 4, fontSize: 12 }} />
              <input type="number" value={selectedBlock.y} onChange={e => updateBlock('y', +e.target.value)}
                style={{ width: '50%', background: '#313244', border: 'none', color: '#fff', padding: 6, borderRadius: 4, fontSize: 12 }} />
            </div>

            <label style={{ fontSize: 11, color: '#888' }}>W / H</label>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              <input type="number" value={selectedBlock.w} onChange={e => updateBlock('w', +e.target.value)}
                style={{ width: '50%', background: '#313244', border: 'none', color: '#fff', padding: 6, borderRadius: 4, fontSize: 12 }} />
              <input type="number" value={selectedBlock.h} onChange={e => updateBlock('h', +e.target.value)}
                style={{ width: '50%', background: '#313244', border: 'none', color: '#fff', padding: 6, borderRadius: 4, fontSize: 12 }} />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, marginBottom: 12 }}>
              <input type="checkbox" checked={selectedBlock.border} onChange={e => updateBlock('border', e.target.checked)} />
              Borda
            </label>

            <button onClick={deleteSelected} style={{
              width: '100%', background: '#f38ba8', color: '#000',
              border: 'none', padding: 8, borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', fontSize: 12
            }}>🗑️ Deletar bloco</button>
          </>
        ) : (
          <div style={{ color: '#555', fontSize: 12, marginTop: 40, textAlign: 'center' }}>
            Clique em um bloco para editar suas propriedades
          </div>
        )}
      </div>
    </div>
  )
}

export default FichaEditor
