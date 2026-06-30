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

// Grid medido pixel a pixel da referencia F6B90E44 (983x722 -> base 981x711)
const BRD = '2px solid #000'

// Verticais
const X0  = 0
const XD  = 172   // divisoria DESCRICAO | CAIXINHAS no rodape
const X1  = 350   // divisoria COR | BRANCO
const X2  = 673   // col-esq | col-dir
const XS1 = 789   // divisoria SIM | NAO
const X3  = 811   // label | valor tabela
const X4  = 981

// Horizontais
const Y0  = 0
const Y1  = 160   // fim NOME / fim TABELA
const Y2  = 377   // fim COR / fim NUMERO
const YAM = 419   // fim AMIDO label
const YSN = 426   // fim SIM/NAO
const Y3  = 550   // inicio rodape
const Y4  = 700   // borda inferior

const c = (
  x: number, y: number, w: number, h: number,
  extra: React.CSSProperties = {}
): React.CSSProperties => ({
  position: 'absolute', left: x, top: y, width: w, height: h,
  boxSizing: 'border-box', overflow: 'hidden', ...extra,
})

const FichaProducao: React.FC<FichaProducaoProps> = ({
  nomeCliente   = '',
  cor           = '',
  noPedido      = '',
  hora          = '',
  entrada       = '',
  retorno       = '',
  conf          = '',
  numero        = '',
  especificacoes = '',
  materiais     = [],
}) => {

  const tableRows = [
    { label: 'Nº PEDIDO', value: noPedido },
    { label: 'HORA',      value: hora },
    { label: 'ENTRADA',   value: entrada },
    { label: 'RETORNO',   value: retorno },
    { label: 'CONF.',     value: conf },
  ]

  return (
    <div style={{
      position: 'relative',
      width: X4,
      height: Y4,
      background: '#fff',
      border: BRD,
      fontFamily: 'Arial, Helvetica, sans-serif',
      boxSizing: 'border-box',
      flexShrink: 0,
    }}>

      {/* ── NOME CLIENTE  x=0,y=0,w=673,h=160 ── */}
      <div style={c(X0, Y0, X2, Y1, {
        borderRight: BRD, borderBottom: BRD,
        display: 'flex', alignItems: 'flex-start',
        padding: '10px 10px 0 14px',
      })}>
        <span style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.1, color: '#000', wordBreak: 'break-word' }}>
          {nomeCliente}
        </span>
      </div>

      {/* ── COR  x=0,y=160,w=350,h=217 ── */}
      <div style={c(X0, Y1, X1, Y2 - Y1, {
        borderRight: BRD, borderBottom: BRD,
        display: 'flex', alignItems: 'center',
        paddingLeft: 14,
      })}>
        <span style={{ fontSize: 52, fontWeight: 900, color: '#000', lineHeight: 1 }}>
          {cor}
        </span>
      </div>

      {/* ── BRANCO  x=350,y=160,w=323,h=217 ── */}
      <div style={c(X1, Y1, X2 - X1, Y2 - Y1, {
        borderBottom: BRD,
      })} />

      {/* ── MATERIAIS  x=0,y=377,w=673,h=173 ── */}
      <div style={c(X0, Y2, X2, Y3 - Y2, {
        borderRight: BRD, borderBottom: BRD,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-start',
        padding: '8px 8px 4px 10px', gap: 6,
      })}>
        {materiais.map((m, i) => (
          <p key={i} style={{
            fontSize: 17, fontWeight: 700, color: '#000',
            lineHeight: 1.3, margin: 0,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{m}</p>
        ))}
      </div>

      {/* ── DESCRICAO  x=0,y=550,w=172,h=150 ── */}
      <div style={c(X0, Y3, XD, Y4 - Y3, {
        borderRight: BRD,
        display: 'flex', alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '0 4px 12px 4px',
      })}>
        <div style={{
          position: 'absolute',
          left: 12, right: 12, top: 48,
          height: 2, background: '#000',
        }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: '#000' }}>Descrição</span>
      </div>

      {/* ── CAIXINHAS SOLIDEZ/APROVACAO  x=172,y=550,w=501,h=150 ── */}
      <div style={c(XD, Y3, X2 - XD, Y4 - Y3, {
        display: 'flex', flexDirection: 'row',
        alignItems: 'flex-start',
        padding: '8px 0 0 12px',
      })}>
        {/* coluna das caixas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0 }}>
          {[0,1,2,3,4,5].map(i => (
            <div key={i} style={{
              width: 22, height: 22,
              border: BRD, background: '#fff', flexShrink: 0,
              marginTop: i === 3 ? 10 : 0,
            }} />
          ))}
        </div>
        {/* labels */}
        <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 900, color: '#000', lineHeight: 1, whiteSpace: 'nowrap', marginTop: 4 }}>
            SOLIDEZ
          </span>
          <span style={{ fontSize: 14, fontWeight: 900, color: '#000', lineHeight: 1, whiteSpace: 'nowrap', marginTop: 84 }}>
            APROVAÇÃO
          </span>
        </div>
      </div>

      {/* ── TABELA DIREITA  x=673,y=0,w=308,h=160 ── */}
      <div style={c(X2, Y0, X4 - X2, Y1, {
        borderLeft: BRD,
        display: 'flex', flexDirection: 'column',
      })}>
        {tableRows.map((row, i) => (
          <div key={i} style={{
            display: 'flex', flex: 1,
            borderBottom: i < tableRows.length - 1 ? BRD : 'none',
          }}>
            <div style={{
              width: X3 - X2, flexShrink: 0, borderRight: BRD,
              fontSize: 14, fontWeight: 900, color: '#000',
              display: 'flex', alignItems: 'center', paddingLeft: 6,
            }}>{row.label}</div>
            <div style={{
              flex: 1, fontSize: 14, fontWeight: 900, color: '#000',
              display: 'flex', alignItems: 'center',
              justifyContent: 'flex-end', paddingRight: 8,
              whiteSpace: 'nowrap',
            }}>{row.value}</div>
          </div>
        ))}
      </div>

      {/* ── NUMERO GRANDE  x=673,y=160,w=308,h=217 ── */}
      <div style={c(X2, Y1, X4 - X2, Y2 - Y1, {
        borderLeft: BRD, borderBottom: BRD,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      })}>
        <span style={{ fontSize: 130, fontWeight: 900, color: '#000', lineHeight: 1 }}>
          {numero}
        </span>
      </div>

      {/* ── AMIDO  x=673,y=377,w=308,h=42 ── */}
      <div style={c(X2, Y2, X4 - X2, YAM - Y2, {
        borderLeft: BRD, borderBottom: BRD,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      })}>
        <span style={{ fontSize: 16, fontWeight: 900, color: '#000', letterSpacing: '0.1em' }}>
          AMIDO
        </span>
      </div>

      {/* ── SIM / NAO  x=673,y=419,w=308,h=7 ── */}
      {/* altura real: YSN-YAM = 7px parece pequeno — na imagem é ~30px */}
      {/* usando y=377..419 para AMIDO (42px) e y=419..550 para SIM/NAO+vazio */}
      <div style={c(X2, YAM, X4 - X2, YSN - YAM + 80, {
        borderLeft: BRD, borderBottom: BRD,
        display: 'flex', flexDirection: 'row',
        alignItems: 'center',
      })}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 8,
          borderRight: BRD, height: '100%',
        }}>
          <div style={{ width: 20, height: 20, border: BRD, background: '#fff', flexShrink: 0 }} />
          <span style={{ fontSize: 15, fontWeight: 900, color: '#000' }}>SIM</span>
        </div>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 8, height: '100%',
        }}>
          <div style={{ width: 20, height: 20, border: BRD, background: '#fff', flexShrink: 0 }} />
          <span style={{ fontSize: 15, fontWeight: 900, color: '#000' }}>NÃO</span>
        </div>
      </div>

      {/* ── ESPECIFICACOES  x=673,y=SIM+vazio,w=308 ate fim ── */}
      <div style={c(X2, YAM + YSN - YAM + 80, X4 - X2, Y4 - (YAM + YSN - YAM + 80), {
        borderLeft: BRD,
        display: 'flex', alignItems: 'flex-end',
        padding: '0 6px 10px 6px',
      })}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#000' }}>
          {especificacoes || 'ESPECIFICAÇÕES'}
        </span>
      </div>

    </div>
  )
}

export default FichaProducao
