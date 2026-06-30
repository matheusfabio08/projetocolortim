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

// Grid medido pixel a pixel ref 609E192D (986x719) -> base 981x719
const X_ESQ  = 0
const X_COR  = 351
const X_BRC  = 400
const X_MID  = 673
const X_LBL  = 811
const X_DIR  = 981
const CX_W   = 25

const Y_TOP  = 0
const Y_T1   = 32
const Y_T2   = 63
const Y_T3   = 95
const Y_T4   = 126
const Y_T5   = 158
const Y_COR  = 328
const Y_AMI  = 390
const Y_SN   = 429
const Y_ROD  = 555
const Y_S2   = 581
const Y_S3   = 606
const Y_SEP  = 631
const Y_A1   = 656
const Y_A2   = 681
const Y_BOT  = 707

const B  = '2px solid #000'
const B1 = '1px solid #000'

const box = (
  x: number, y: number, w: number, h: number,
  s: React.CSSProperties = {}
): React.CSSProperties => ({
  position: 'absolute', left: x, top: y, width: w, height: h,
  boxSizing: 'border-box', overflow: 'hidden', ...s,
})

const FichaProducao: React.FC<FichaProducaoProps> = ({
  nomeCliente = '',
  cor = '',
  noPedido = '',
  hora = '',
  entrada = '',
  retorno = '',
  conf = '',
  numero = '',
  especificacoes = '',
  materiais = [],
}) => {

  const tableYs = [Y_TOP, Y_T1, Y_T2, Y_T3, Y_T4, Y_T5]
  const tableRows = [
    { label: 'N\u00ba PEDIDO', value: noPedido },
    { label: 'HORA',      value: hora },
    { label: 'ENTRADA',   value: entrada },
    { label: 'RETORNO',   value: retorno },
    { label: 'CONF.',     value: conf },
  ]

  return (
    <div style={{
      position: 'relative',
      width: X_DIR,
      height: Y_BOT,
      background: '#fff',
      border: B,
      fontFamily: 'Arial, Helvetica, sans-serif',
      boxSizing: 'border-box',
      flexShrink: 0,
    }}>

      {/* NOME */}
      <div style={box(X_ESQ, Y_TOP, X_MID, Y_T5, {
        borderRight: B, borderBottom: B1,
        display: 'flex', alignItems: 'flex-start',
        padding: '14px 10px 0 14px',
      })}>
        <span style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.05, color: '#000', wordBreak: 'break-word' }}>
          {nomeCliente}
        </span>
      </div>

      {/* COR */}
      <div style={box(X_ESQ, Y_T5, X_COR, Y_COR - Y_T5, {
        borderRight: B1, borderBottom: B1,
        display: 'flex', alignItems: 'center',
        paddingLeft: 14,
      })}>
        <span style={{ fontSize: 44, fontWeight: 900, color: '#000', lineHeight: 1 }}>
          {cor}
        </span>
      </div>

      {/* BRANCO col 1 */}
      <div style={box(X_COR, Y_T5, X_BRC - X_COR, Y_COR - Y_T5, {
        borderRight: B1, borderBottom: B1,
      })} />

      {/* BRANCO col 2 */}
      <div style={box(X_BRC, Y_T5, X_MID - X_BRC, Y_COR - Y_T5, {
        borderBottom: B1,
      })} />

      {/* MATERIAIS */}
      <div style={box(X_ESQ, Y_COR, X_MID, Y_ROD - Y_COR, {
        borderRight: B, borderBottom: B1,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-start',
        padding: '8px 10px 4px 10px', gap: 5,
      })}>
        {materiais.map((m, i) => (
          <p key={i} style={{
            fontSize: 15, fontWeight: 700, color: '#000',
            lineHeight: 1.35, margin: 0,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{m}</p>
        ))}
      </div>

      {/* DESCRICAO */}
      <div style={box(X_ESQ, Y_ROD, 127, Y_BOT - Y_ROD, {
        borderRight: B1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-end',
        padding: '0 6px 10px 6px',
      })}>
        <div style={{ width: '85%', height: 1, background: '#000', marginBottom: 6 }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: '#000', whiteSpace: 'nowrap' }}>Descri\u00e7\u00e3o</span>
      </div>

      {/* Linha vertical separando caixas do label */}
      <div style={box(127 + CX_W, Y_ROD, 1, Y_BOT - Y_ROD, { background: '#000' })} />

      {/* Linha horizontal SOLIDEZ|APROVACAO */}
      <div style={box(127, Y_SEP, X_MID - 127, 1, { background: '#000' })} />

      {/* CAIXAS SOLIDEZ */}
      {([Y_ROD, Y_S2, Y_S3] as number[]).map((yy, i) => {
        const ends = [Y_S2, Y_S3, Y_SEP]
        return (
          <div key={`s${i}`} style={box(127, yy, CX_W, ends[i] - yy, {
            border: B1,
          })} />
        )
      })}

      {/* LABEL SOLIDEZ */}
      <span style={box(127 + CX_W + 8, Y_ROD + 6, 200, 18, {
        fontSize: 14, fontWeight: 900, color: '#000',
        display: 'flex', alignItems: 'center',
      } as React.CSSProperties)}>SOLIDEZ</span>

      {/* CAIXAS APROVACAO */}
      {([Y_SEP, Y_A1, Y_A2] as number[]).map((yy, i) => {
        const ends = [Y_A1, Y_A2, Y_BOT]
        return (
          <div key={`a${i}`} style={box(127, yy, CX_W, ends[i] - yy, {
            border: B1,
          })} />
        )
      })}

      {/* LABEL APROVACAO */}
      <span style={box(127 + CX_W + 8, Y_SEP + 6, 200, 18, {
        fontSize: 14, fontWeight: 900, color: '#000',
        display: 'flex', alignItems: 'center',
      } as React.CSSProperties)}>APROVA\u00c7\u00c3O</span>

      {/* TABELA DIREITA */}
      <div style={box(X_MID, Y_TOP, X_DIR - X_MID, Y_T5, { borderLeft: B })}>
        {tableRows.map((row, i) => {
          const yStart = tableYs[i]
          const yEnd   = tableYs[i + 1]
          return (
            <div key={i} style={{
              position: 'absolute', left: 0, top: yStart,
              width: X_DIR - X_MID, height: yEnd - yStart,
              display: 'flex',
              borderBottom: i < 4 ? B1 : 'none',
            }}>
              <div style={{
                width: X_LBL - X_MID, flexShrink: 0, borderRight: B1,
                fontSize: 14, fontWeight: 900, color: '#000',
                display: 'flex', alignItems: 'center', paddingLeft: 8,
              }}>{row.label}</div>
              <div style={{
                flex: 1, fontSize: 14, fontWeight: 900, color: '#000',
                display: 'flex', alignItems: 'center',
                justifyContent: 'flex-end', paddingRight: 8, whiteSpace: 'nowrap',
              }}>{row.value}</div>
            </div>
          )
        })}
      </div>

      {/* NUMERO GRANDE */}
      <div style={box(X_MID, Y_T5, X_DIR - X_MID, Y_COR - Y_T5, {
        borderLeft: B, borderBottom: B1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      })}>
        <span style={{ fontSize: 130, fontWeight: 900, color: '#000', lineHeight: 1 }}>
          {numero}
        </span>
      </div>

      {/* AMIDO */}
      <div style={box(X_MID, Y_COR, X_DIR - X_MID, Y_AMI - Y_COR, {
        borderLeft: B, borderBottom: B1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      })}>
        <span style={{ fontSize: 16, fontWeight: 900, color: '#000', letterSpacing: '0.12em' }}>AMIDO</span>
      </div>

      {/* SIM / NAO */}
      <div style={box(X_MID, Y_AMI, X_DIR - X_MID, Y_SN - Y_AMI, {
        borderLeft: B, borderBottom: B1,
        display: 'flex',
      })}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 8,
          borderRight: B1, height: '100%',
        }}>
          <div style={{ width: 18, height: 18, border: B1, background: '#fff', flexShrink: 0 }} />
          <span style={{ fontSize: 15, fontWeight: 900, color: '#000' }}>SIM</span>
        </div>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 8, height: '100%',
        }}>
          <div style={{ width: 18, height: 18, border: B1, background: '#fff', flexShrink: 0 }} />
          <span style={{ fontSize: 15, fontWeight: 900, color: '#000' }}>N\u00c3O</span>
        </div>
      </div>

      {/* ESPECIFICACOES */}
      <div style={box(X_MID, Y_SN, X_DIR - X_MID, Y_BOT - Y_SN, {
        borderLeft: B,
        display: 'flex', alignItems: 'flex-end',
        padding: '0 6px 8px 6px',
      })}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#000' }}>
          {especificacoes || 'ESPECIFICA\u00c7\u00d5ES'}
        </span>
      </div>

    </div>
  )
}

export default FichaProducao
