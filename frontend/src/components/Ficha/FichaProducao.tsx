import React from 'react'

interface FichaProducaoProps {
  nomeCliente?: string
  cor?: string
  noPedido?: string
  hora?: string
  entrada?: string
  retorno?: string
  conf?: string
  numero?: string | number
  especificacoes?: string
  materiais?: string[]
}

// ── medidas absolutas (px) ──────────────────────────────
const W = 981
const H = 711
const BRD = '2px solid #000'

// Grid X
const X0  = 0
const X1  = 350   // divisória interna COR|branco
const X2  = 673   // separação col-esq / col-dir
const X3  = 812   // separação label/valor tabela
const X4  = 981

// Grid Y
const Y0  = 0
const Y1  = 158   // fim linha 1 (nome / tabela)
const Y2  = 379   // fim linha 2 (cor / branco / numero)
const Y3  = 555   // fim linha 3 (materiais / especif)
const Y4  = 711   // fim

const cell = (x: number, y: number, w: number, h: number, extra: React.CSSProperties = {}): React.CSSProperties => ({
  position: 'absolute',
  left:   x,
  top:    y,
  width:  w,
  height: h,
  borderRight:  BRD,
  borderBottom: BRD,
  overflow: 'hidden',
  boxSizing: 'border-box',
  ...extra,
})

const Box: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode }> =
  ({ style, children }) => <div style={style}>{children}</div>

const FichaProducao: React.FC<FichaProducaoProps> = ({
  nomeCliente   = 'NOME CLIENTE',
  cor           = 'COR',
  noPedido      = '',
  hora          = '',
  entrada       = '',
  retorno       = '',
  conf          = '',
  numero        = '06',
  especificacoes = 'ESPECIFICAÇÕES',
  materiais     = [],
}) => {

  const tableRows = [
    { label: 'Nº PEDIDO', value: noPedido },
    { label: 'HORA',      value: hora },
    { label: 'ENTRADA',   value: entrada },
    { label: 'RETORNO',   value: retorno },
    { label: 'CONF.',     value: conf },
  ]
  const rowH = Y1 / tableRows.length // 31.6px

  return (
    <div style={{
      position: 'relative',
      width:  W,
      height: H,
      background: '#fff',
      border: BRD,
      fontFamily: 'Arial, Helvetica, sans-serif',
      boxSizing: 'border-box',
      flexShrink: 0,
      overflow: 'hidden',
    }}>

      {/* ── NOME CLIENTE  x=0,y=0,w=673,h=158 ── */}
      <Box style={cell(X0, Y0, X2, Y1, {
        display: 'flex',
        alignItems: 'flex-start',
        padding: '10px 10px 0 16px',
      })}>
        <span style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.1, color: '#000', wordBreak: 'break-word' }}>
          {nomeCliente}
        </span>
      </Box>

      {/* ── COR  x=0,y=158,w=350,h=221 ── */}
      <Box style={cell(X0, Y1, X1, Y2 - Y1, {
        display: 'flex',
        alignItems: 'center',
        padding: '0 0 0 16px',
      })}>
        <span style={{ fontSize: 52, fontWeight: 900, color: '#000', lineHeight: 1 }}>
          {cor}
        </span>
      </Box>

      {/* ── BRANCO  x=350,y=158,w=323,h=221 ── */}
      <Box style={cell(X1, Y1, X2 - X1, Y2 - Y1, { borderRight: 'none' })} />

      {/* ── MATERIAIS  x=0,y=379,w=673,h=176 ── */}
      <Box style={cell(X0, Y2, X2, Y3 - Y2, {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        padding: '8px 8px 4px 8px',
        gap: 8,
      })}>
        {materiais.map((m, i) => (
          <p key={i} style={{
            fontSize: 18, fontWeight: 700, color: '#000',
            lineHeight: 1.2, margin: 0,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{m}</p>
        ))}
      </Box>

      {/* ── DESCRIÇÃO  x=0,y=555,w=350,h=156 ── */}
      <Box style={cell(X0, Y3, X1, Y4 - Y3, {
        borderBottom: 'none',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '0 0 12px 0',
      })}>
        {/* linha de assinatura */}
        <div style={{
          position: 'absolute',
          left: 24, right: 24, top: 55,
          height: 2, background: '#000',
        }} />
        <span style={{ fontSize: 15, fontWeight: 700, color: '#000', letterSpacing: '0.04em' }}>
          DESCRIÇÃO
        </span>
      </Box>

      {/* ── CAIXINHAS  x=350,y=555,w=323,h=156 ── */}
      {/*  6 caixas: 3 SOLIDEZ + 3 APROVAÇÃO  */}
      <Box style={cell(X1, Y3, X2 - X1, Y4 - Y3, {
        borderRight: 'none',
        borderBottom: 'none',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: '10px 0 0 8px',
      })}>
        {/* coluna das caixas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
          {[0,1,2,3,4,5].map(i => (
            <div key={i} style={{
              width: 22, height: 22,
              border: BRD,
              background: '#fff',
              flexShrink: 0,
              marginTop: i === 3 ? 8 : 0,  // gap entre grupos
            }} />
          ))}
        </div>
        {/* coluna dos labels */}
        <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 900, color: '#000', lineHeight: 1, whiteSpace: 'nowrap', marginTop: 4 }}>
            SOLIDEZ
          </span>
          {/* pular: 3 caixas (22+4)×3 = 78px + gap 8px = 86px, menos o marginTop 4 já usado */}
          <span style={{ fontSize: 14, fontWeight: 900, color: '#000', lineHeight: 1, whiteSpace: 'nowrap', marginTop: 82 }}>
            APROVAÇÃO
          </span>
        </div>
      </Box>

      {/* ── TABELA DIREITA  x=673,y=0,w=308,h=158 ── */}
      <div style={{
        position: 'absolute',
        left: X2, top: Y0,
        width: X4 - X2, height: Y1,
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxSizing: 'border-box',
        borderLeft: BRD,
      }}>
        {tableRows.map((row, i) => (
          <div key={i} style={{
            display: 'flex',
            flex: 1,
            borderBottom: i < tableRows.length - 1 ? BRD : 'none',
          }}>
            <div style={{
              width: X3 - X2,
              flexShrink: 0,
              borderRight: BRD,
              fontSize: 15, fontWeight: 900, color: '#000',
              display: 'flex', alignItems: 'center',
              paddingLeft: 6, overflow: 'hidden',
            }}>{row.label}</div>
            <div style={{
              flex: 1,
              fontSize: 15, fontWeight: 900, color: '#000',
              display: 'flex', alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: 10, overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}>{row.value}</div>
          </div>
        ))}
      </div>

      {/* ── NÚMERO GRANDE  x=673,y=158,w=308,h=221 ── */}
      <Box style={cell(X2, Y1, X4 - X2, Y2 - Y1, {
        borderRight: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      })}>
        <span style={{ fontSize: 130, fontWeight: 900, color: '#000', lineHeight: 1 }}>
          {numero}
        </span>
      </Box>

      {/* ── ESPECIFICAÇÕES  x=673,y=379,w=308,h=332 ── */}
      <Box style={cell(X2, Y2, X4 - X2, Y4 - Y2, {
        borderRight: 'none',
        borderBottom: 'none',
        display: 'flex', alignItems: 'flex-end',
        padding: '0 6px 8px 6px',
      })}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#000' }}>
          {especificacoes}
        </span>
      </Box>

    </div>
  )
}

export default FichaProducao
