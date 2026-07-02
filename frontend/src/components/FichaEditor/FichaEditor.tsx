import React, { useState } from 'react'

// ─ Tipos ────────────────────────────────────────────────────────
interface Cell {
  content: string
  fontSize: number
  fontWeight: 'normal' | 'bold'
  align: 'left' | 'center' | 'right'
  colSpan: number
  rowSpan: number
  hidden: boolean   // true = absorvida por mesclagem
  border: boolean
  background: string
}

type Grid = Cell[][]

const COLS = 8
const ROWS = 12

const DYNAMIC_FIELDS = [
  '{{cliente}}', '{{cor}}', '{{numero}}',
  '{{noPedido}}', '{{hora}}', '{{materiais}}',
  '{{entrada}}', '{{retorno}}',
]

const COL_WIDTHS = [90, 90, 90, 90, 90, 90, 90, 90]  // px por coluna
const ROW_HEIGHTS = [60, 60, 50, 50, 40, 40, 40, 40, 40, 40, 35, 35]  // px por linha

function makeCell(content = '', opts: Partial<Cell> = {}): Cell {
  return {
    content,
    fontSize: 12,
    fontWeight: 'normal',
    align: 'center',
    colSpan: 1,
    rowSpan: 1,
    hidden: false,
    border: true,
    background: '#ffffff',
    ...opts,
  }
}

// ─ Layout inicial igual à ficha física ────────────────────────────
function makeInitialGrid(): Grid {
  const g: Grid = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => makeCell())
  )

  // Linha 0: {{cliente}} ocupa colunas 0-3 | {{numero}} ocupa colunas 4-7
  g[0][0] = makeCell('{{cliente}}', { colSpan: 4, fontWeight: 'bold', fontSize: 28, background: '#fff' })
  g[0][1].hidden = true; g[0][2].hidden = true; g[0][3].hidden = true
  g[0][4] = makeCell('{{numero}}', { colSpan: 4, fontWeight: 'bold', fontSize: 52, background: '#fff' })
  g[0][5].hidden = true; g[0][6].hidden = true; g[0][7].hidden = true

  // Linha 1: {{cor}} ocupa colunas 0-3 | Nº PEDIDO + valor colunas 4-7
  g[1][0] = makeCell('{{cor}}', { colSpan: 4, fontWeight: 'bold', fontSize: 28 })
  g[1][1].hidden = true; g[1][2].hidden = true; g[1][3].hidden = true
  g[1][4] = makeCell('Nº PEDIDO', { fontWeight: 'bold', fontSize: 9, colSpan: 2 })
  g[1][5].hidden = true
  g[1][6] = makeCell('{{noPedido}}', { colSpan: 2, fontSize: 11 })
  g[1][7].hidden = true

  // Linha 2: {{materiais}} ocupa colunas 0-3 (rowSpan 3) | HORA colunas 4-7
  g[2][0] = makeCell('{{materiais}}', { colSpan: 4, rowSpan: 3, fontSize: 11, fontWeight: 'normal', align: 'left' })
  g[2][1].hidden = true; g[2][2].hidden = true; g[2][3].hidden = true
  g[2][4] = makeCell('HORA', { fontWeight: 'bold', fontSize: 9, colSpan: 2 })
  g[2][5].hidden = true
  g[2][6] = makeCell('{{hora}}', { colSpan: 2, fontSize: 11 })
  g[2][7].hidden = true

  // Linha 3: materiais continua | AMIDO título
  g[3][0].hidden = true; g[3][1].hidden = true; g[3][2].hidden = true; g[3][3].hidden = true
  g[3][4] = makeCell('AMIDO', { colSpan: 4, fontWeight: 'bold', fontSize: 10 })
  g[3][5].hidden = true; g[3][6].hidden = true; g[3][7].hidden = true

  // Linha 4: materiais continua | SIM / NÃO
  g[4][0].hidden = true; g[4][1].hidden = true; g[4][2].hidden = true; g[4][3].hidden = true
  g[4][4] = makeCell('☐ SIM', { colSpan: 2, fontWeight: 'bold', fontSize: 12 })
  g[4][5].hidden = true
  g[4][6] = makeCell('☐ NÃO', { colSpan: 2, fontWeight: 'bold', fontSize: 12 })
  g[4][7].hidden = true

  // Linha 5: Descrição col 0-1 | SOLIDEZ col 2-3 | SOLIDEZ direito col 4-5 | assinatura 6-7
  g[5][0] = makeCell('Descrição', { rowSpan: 2, colSpan: 2, fontWeight: 'bold', fontSize: 9 })
  g[5][1].hidden = true
  g[5][2] = makeCell('SOLIDEZ', { colSpan: 2, fontWeight: 'bold', fontSize: 9, align: 'left' })
  g[5][3].hidden = true
  g[5][4] = makeCell('SOLIDEZ', { colSpan: 2, fontWeight: 'bold', fontSize: 9, align: 'left' })
  g[5][5].hidden = true
  g[5][6] = makeCell('', { colSpan: 2 })
  g[5][7].hidden = true

  // Linha 6: descrição continua | APROVAÇÃO
  g[6][0].hidden = true; g[6][1].hidden = true
  g[6][2] = makeCell('APROVAÇÃO', { colSpan: 2, fontWeight: 'bold', fontSize: 9, align: 'left' })
  g[6][3].hidden = true
  g[6][4] = makeCell('APROVAÇÃO', { colSpan: 2, fontWeight: 'bold', fontSize: 9, align: 'left' })
  g[6][5].hidden = true
  g[6][6] = makeCell('', { colSpan: 2 })
  g[6][7].hidden = true

  // Linhas 7-11: vazias para uso livre
  for (let r = 7; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      g[r][c] = makeCell('')
    }
  }

  return g
}

// ─ Componente ───────────────────────────────────────────────
export default function FichaEditor() {
  const [grid, setGrid] = useState<Grid>(makeInitialGrid)
  const [selected, setSelected] = useState<[number, number] | null>(null)
  const [colWidths, setColWidths] = useState<number[]>(COL_WIDTHS)
  const [rowHeights, setRowHeights] = useState<number[]>(ROW_HEIGHTS)
  const [mergeStart, setMergeStart] = useState<[number, number] | null>(null)

  const sel = selected ? grid[selected[0]][selected[1]] : null

  const updateCell = (prop: keyof Cell, val: any) => {
    if (!selected) return
    const [r, c] = selected
    setGrid(g => {
      const ng = g.map(row => row.map(cell => ({ ...cell })))
      ;(ng[r][c] as any)[prop] = val
      return ng
    })
  }

  const insertField = (field: string) => {
    if (!selected) return
    updateCell('content', field)
  }

  const mergeSelected = () => {
    if (!mergeStart || !selected) return
    const [r1, c1] = mergeStart
    const [r2, c2] = selected
    const rMin = Math.min(r1, r2), rMax = Math.max(r1, r2)
    const cMin = Math.min(c1, c2), cMax = Math.max(c1, c2)
    setGrid(g => {
      const ng = g.map(row => row.map(cell => ({ ...cell })))
      ng[rMin][cMin].colSpan = cMax - cMin + 1
      ng[rMin][cMin].rowSpan = rMax - rMin + 1
      for (let r = rMin; r <= rMax; r++)
        for (let c = cMin; c <= cMax; c++)
          if (r !== rMin || c !== cMin) ng[r][c].hidden = true
      return ng
    })
    setMergeStart(null)
    setSelected([rMin, cMin])
  }

  const unmergeSelected = () => {
    if (!selected) return
    const [r, c] = selected
    const cell = grid[r][c]
    setGrid(g => {
      const ng = g.map(row => row.map(cc => ({ ...cc })))
      for (let dr = 0; dr < cell.rowSpan; dr++)
        for (let dc = 0; dc < cell.colSpan; dc++) {
          ng[r + dr][c + dc].hidden = false
          ng[r + dr][c + dc].colSpan = 1
          ng[r + dr][c + dc].rowSpan = 1
        }
      return ng
    })
  }

  const resetGrid = () => {
    if (confirm('Resetar para o layout padrão?')) {
      setGrid(makeInitialGrid())
      setSelected(null)
    }
  }

  const exportJSON = () => {
    const data = { grid, colWidths, rowHeights }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'ficha-layout.json'; a.click()
  }

  const totalW = colWidths.reduce((a, b) => a + b, 0)

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif', background: '#f0f0f0', fontSize: 13 }}>

      {/* PAINEL ESQUERDO */}
      <div style={{ width: 190, background: '#1e1e2e', color: '#fff', padding: 12, display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto', flexShrink: 0 }}>
        <div style={{ fontWeight: 'bold', color: '#cba6f7', fontSize: 14, marginBottom: 4 }}>🗒️ Ficha Editor</div>

        <div style={sLabel}>CAMPOS DINÂMICOS</div>
        <div style={{ fontSize: 10, color: '#666', marginBottom: 2 }}>Clique numa célula, depois no campo:</div>
        {DYNAMIC_FIELDS.map(f => (
          <button key={f} onClick={() => insertField(f)} style={dynBtn}>{f}</button>
        ))}

        <div style={sLabel}>MESCLAGEM</div>
        <button
          onClick={() => { if (!selected) return; setMergeStart(selected) }}
          style={{ ...sBtn, background: mergeStart ? '#45475a' : '#313244' }}
        >
          {mergeStart ? `✔ De [${mergeStart}] até...` : '1️⃣ Iniciar mescla'}
        </button>
        {mergeStart && (
          <button onClick={mergeSelected} style={{ ...sBtn, background: '#a6e3a1', color: '#000' }}>
            2️⃣ Mesclar até aqui
          </button>
        )}
        <button onClick={unmergeSelected} style={sBtn}>Desfazer mescla</button>

        <div style={{ flex: 1 }} />
        <button onClick={resetGrid} style={{ ...sBtn, background: '#f9e2af', color: '#000' }}>🔄 Reset</button>
        <button onClick={exportJSON} style={{ ...sBtn, background: '#a6e3a1', color: '#000', fontWeight: 'bold' }}>💾 Exportar JSON</button>
      </div>

      {/* CANVAS */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20 }}>
        <div style={{ marginBottom: 8, color: '#555', fontSize: 11 }}>
          Clique na célula para editar • Use o painel direito para formatar
          {mergeStart && <span style={{ color: '#f38ba8', marginLeft: 8 }}>Agora clique na célula final da mescla e clique "Mesclar até aqui"</span>}
        </div>

        <div style={{ background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', display: 'inline-block' }}>
          <table style={{ borderCollapse: 'collapse', width: totalW, tableLayout: 'fixed' }}>
            <colgroup>
              {colWidths.map((w, ci) => (
                <col key={ci} style={{ width: w }} />
              ))}
            </colgroup>
            <tbody>
              {grid.map((row, ri) => (
                <tr key={ri} style={{ height: rowHeights[ri] }}>
                  {row.map((cell, ci) => {
                    if (cell.hidden) return null
                    const isSel = selected?.[0] === ri && selected?.[1] === ci
                    const isMergeStart = mergeStart?.[0] === ri && mergeStart?.[1] === ci
                    return (
                      <td
                        key={ci}
                        colSpan={cell.colSpan}
                        rowSpan={cell.rowSpan}
                        onClick={() => setSelected([ri, ci])}
                        style={{
                          border: cell.border ? '1px solid #000' : '1px solid transparent',
                          padding: '2px 6px',
                          fontSize: cell.fontSize,
                          fontWeight: cell.fontWeight,
                          textAlign: cell.align,
                          verticalAlign: 'middle',
                          background: isMergeStart ? '#1e3a5f' : isSel ? '#e8f0fe' : cell.background,
                          outline: isSel ? '2px solid #4285f4' : 'none',
                          outlineOffset: -2,
                          cursor: 'pointer',
                          userSelect: 'none',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          color: isMergeStart ? '#89b4fa' : '#000',
                          boxSizing: 'border-box',
                          overflow: 'hidden',
                        }}
                      >
                        {cell.content}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Controle de tamanho de colunas */}
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ fontSize: 11, color: '#666' }}>Largura colunas (px):</span>
          {colWidths.map((w, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ fontSize: 10, color: '#888' }}>C{i + 1}:</span>
              <input
                type="number" value={w} min={30} max={300}
                onChange={e => setColWidths(cw => cw.map((v, j) => j === i ? +e.target.value : v))}
                style={{ width: 48, fontSize: 11, padding: '2px 4px', border: '1px solid #ccc', borderRadius: 4 }}
              />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ fontSize: 11, color: '#666' }}>Altura linhas (px):</span>
          {rowHeights.map((h, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ fontSize: 10, color: '#888' }}>L{i + 1}:</span>
              <input
                type="number" value={h} min={20} max={300}
                onChange={e => setRowHeights(rh => rh.map((v, j) => j === i ? +e.target.value : v))}
                style={{ width: 48, fontSize: 11, padding: '2px 4px', border: '1px solid #ccc', borderRadius: 4 }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* PAINEL DIREITO — propriedades da célula selecionada */}
      <div style={{ width: 200, background: '#1e1e2e', color: '#cdd6f4', padding: 14, overflowY: 'auto', flexShrink: 0 }}>
        {sel ? (
          <>
            <div style={{ fontWeight: 'bold', color: '#cba6f7', marginBottom: 12, fontSize: 13 }}>✏️ Célula [{selected![0] + 1},{selected![1] + 1}]</div>

            <label style={pLabel}>Conteúdo</label>
            <textarea
              value={sel.content}
              onChange={e => updateCell('content', e.target.value)}
              rows={3}
              style={{ ...pInput, resize: 'vertical' } as React.CSSProperties}
            />

            <label style={pLabel}>Fonte (px)</label>
            <input type="number" value={sel.fontSize} onChange={e => updateCell('fontSize', +e.target.value)} style={pInput} />

            <label style={pLabel}>Peso</label>
            <select value={sel.fontWeight} onChange={e => updateCell('fontWeight', e.target.value)} style={pInput}>
              <option value="normal">Normal</option>
              <option value="bold">Negrito</option>
            </select>

            <label style={pLabel}>Alinhamento</label>
            <select value={sel.align} onChange={e => updateCell('align', e.target.value)} style={pInput}>
              <option value="left">Esquerda</option>
              <option value="center">Centro</option>
              <option value="right">Direita</option>
            </select>

            <label style={pLabel}>Cor de fundo</label>
            <input type="color" value={sel.background} onChange={e => updateCell('background', e.target.value)}
              style={{ width: '100%', height: 32, border: 'none', borderRadius: 4, marginBottom: 10, cursor: 'pointer' }} />

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, marginBottom: 10 }}>
              <input type="checkbox" checked={sel.border} onChange={e => updateCell('border', e.target.checked)} />
              Mostrar borda
            </label>
          </>
        ) : (
          <div style={{ color: '#555', fontSize: 12, marginTop: 40, textAlign: 'center' }}>
            Clique em uma célula para editar
          </div>
        )}
      </div>
    </div>
  )
}

// Estilos compartilhados
const sLabel: React.CSSProperties = { fontSize: 10, color: '#888', marginTop: 10, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 1 }
const sBtn:   React.CSSProperties = { background: '#313244', color: '#cdd6f4', border: 'none', padding: '7px 10px', borderRadius: 6, cursor: 'pointer', textAlign: 'left', fontSize: 11 }
const dynBtn: React.CSSProperties = { background: '#1e3a5f', color: '#89b4fa', border: 'none', padding: '5px 8px', borderRadius: 6, cursor: 'pointer', textAlign: 'left', fontSize: 11 }
const pLabel: React.CSSProperties = { fontSize: 11, color: '#888', display: 'block', marginBottom: 2 }
const pInput: React.CSSProperties = { width: '100%', background: '#313244', border: 'none', color: '#fff', padding: 6, borderRadius: 4, marginBottom: 10, fontSize: 12, boxSizing: 'border-box' }
