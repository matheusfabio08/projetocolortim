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

// Grid exato medido da referencia fisica (6844AD40)
const W   = 981
const H   = 712
const BRD = '2px solid #000'

// Verticais
const X0  = 0
const X1  = 353   // div COR | branco
const X2  = 673   // col-esq | col-dir
const X3  = 811   // label | valor tabela
const XS1 = 786   // col SIM
const XS2 = 866   // col NAO
const X4  = 981

// Horizontais
const Y0  = 0
const Y1  = 168   // fim nome / fim tabela
const Y2  = 337   // fim COR / fim numero
const YA1 = 387   // fim label AMIDO
const YA2 = 437   // fim SIM/NAO
const Y3  = 562   // inicio rodape
const Y4  = 712   // fim

const s = (x: number, y: number, w: number, h: number,
           extra: React.CSSProperties = {}): React.CSSProperties => ({
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
  const rowH = Y1 / tableRows.length // 33.6px

  return (
    <div style={{
      position: 'relative',
      width: W, height: H,
      background: '#fff',
      border: BRD,
      fontFamily: 'Arial, Helvetica, sans-serif',
      boxSizing: 'border-box',
      flexShrink: 0,
    }}>

      {/* NOME CLIENTE  x=0,y=0,w=673,h=168 */}
      <div style={s(X0, Y0, X2, Y1, {
        borderRight: BRD, borderBottom: BRD,
        display: 'flex', alignItems: 'flex-start',
        padding: '10px 10px 0 14px',
      })}>
        <span style={{ fontSize: 54, fontWeight: 900, lineHeight: 1.1, color: '#000', wordBreak: 'break-word' }}>
          {nomeCliente}
        </span>
      </div>

      {/* COR  x=0,y=168,w=353,h=169 */}
      <div style={s(X0, Y1, X1, Y2 - Y1, {
        borderRight: BRD, borderBottom: BRD,
        display: 'flex', alignItems: 'center',
        padding: '0 0 0 14px',
      })}>
        <span style={{ fontSize: 54, fontWeight: 900, color: '#000', lineHeight: 1 }}>
          {cor}
        </span>
      </div>

      {/* BRANCO  x=353,y=168,w=320,h=169 */}
      <div style={s(X1, Y1, X2 - X1, Y2 - Y1, {
        borderBottom: BRD,
      })} />

      {/* MATERIAIS  x=0,y=337,w=673,h=225 */}
      <div style={s(X0, Y2, X2, Y3 - Y2, {
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

      {/* DESCRICAO  x=0,y=562,w=353,h=150 */}
      <div style={s(X0, Y3, X1, Y4 - Y3, {
        borderRight: BRD,
        display: 'flex', alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '0 0 12px 0',
      })}>
        <div style={{
          position: 'absolute',
          left: 20, right: 20, top: 50,
          height: 2, background: '#000',
        }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: '#000', letterSpacing: '0.04em' }}>
          Descrição
        </span>
      </div>

      {/* CAIXINHAS SOLIDEZ/APROVACAO  x=353,y=562,w=320,h=150 */}
      <div style={s(X1, Y3, X2 - X1, Y4 - Y3, {
        display: 'flex', flexDirection: 'row',
        alignItems: 'flex-start',
        padding: '10px 0 0 10px',
      })}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
          {[0,1,2,3,4,5].map(i => (
            <div key={i} style={{
              width: 22, height: 22,
              border: BRD, background: '#fff', flexShrink: 0,
              marginTop: i === 3 ? 10 : 0,
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 900, color: '#000', lineHeight: 1, whiteSpace: 'nowrap', marginTop: 4 }}>
            SOLIDEZ
          </span>
          <span style={{ fontSize: 14, fontWeight: 900, color: '#000', lineHeight: 1, whiteSpace: 'nowrap', marginTop: 84 }}>
            APROVAÇÃO
          </span>
        </div>
      </div>

      {/* TABELA DIREITA  x=673,y=0,w=308,h=168 */}
      <div style={s(X2, Y0, X4 - X2, Y1, {
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

      {/* NUMERO GRANDE  x=673,y=168,w=308,h=169 */}
      <div style={s(X2, Y1, X4 - X2, Y2 - Y1, {
        borderLeft: BRD, borderBottom: BRD,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      })}>
        <span style={{ fontSize: 130, fontWeight: 900, color: '#000', lineHeight: 1 }}>
          {numero}
        </span>
      </div>

      {/* AMIDO label  x=673,y=337,w=308,h=50 */}
      <div style={s(X2, Y2, X4 - X2, YA1 - Y2, {
        borderLeft: BRD, borderBottom: BRD,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      })}>
        <span style={{ fontSize: 16, fontWeight: 900, color: '#000', letterSpacing: '0.08em' }}>
          AMIDO
        </span>
      </div>

      {/* SIM / NAO  x=673,y=387,w=308,h=50 */}
      <div style={s(X2, YA1, X4 - X2, YA2 - YA1, {
        borderLeft: BRD, borderBottom: BRD,
        display: 'flex', flexDirection: 'row',
        alignItems: 'center',
      })}>
        {/* SIM */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 8,
          borderRight: BRD, height: '100%',
        }}>
          <div style={{ width: 20, height: 20, border: BRD, background: '#fff', flexShrink: 0 }} />
          <span style={{ fontSize: 15, fontWeight: 900, color: '#000' }}>SIM</span>
        </div>
        {/* NAO */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 8,
          height: '100%',
        }}>
          <div style={{ width: 20, height: 20, border: BRD, background: '#fff', flexShrink: 0 }} />
          <span style={{ fontSize: 15, fontWeight: 900, color: '#000' }}>NÃO</span>
        </div>
      </div>

      {/* ESPECIFICACOES (area vazia + label)  x=673,y=437,w=308,h=275 */}
      <div style={s(X2, YA2, X4 - X2, Y4 - YA2, {
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
